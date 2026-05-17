"use client";

import * as React from "react";
import { CalendarDays, ExternalLink, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

import { deleteMeeting } from "@/services/meetings";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import type { DemoPersona, ScheduledMeeting } from "@/types";

interface MeetingsListProps {
  meetings: ScheduledMeeting[];
  isLoading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  showDelete?: boolean;
}

export function MeetingsList({
  meetings,
  isLoading,
  emptyTitle = "No meetings scheduled",
  emptyDescription = "Schedule one from the Signals page or a task to coordinate with your mentor.",
  showDelete = false,
}: MeetingsListProps) {
  const qc = useQueryClient();
  const { personas, role } = useDemo();
  const [now, setNow] = React.useState<number | null>(null);
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteMeeting(id),
    onSuccess: () => {
      toast.success("Meeting deleted");
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (err) => toast.error("Delete failed", { description: toApiError(err).message }),
  });

  React.useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
  }, []);

  const upcoming =
    now === null
      ? meetings
      : meetings.filter((m) => new Date(m.starts_at).getTime() >= now - 15 * 60_000);
  const past =
    now === null
      ? []
      : meetings.filter((m) => new Date(m.starts_at).getTime() < now - 15 * 60_000);

  if (isLoading) {
    return <div className="text-sm text-[color:var(--color-fg-muted)]">Loading…</div>;
  }

  if (meetings.length === 0) {
    return <EmptyState icon={CalendarDays} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-5">
      <Section
        title="Upcoming"
        meetings={upcoming}
        personas={personas}
        role={role}
        onDelete={showDelete ? (id) => deleteMut.mutate(id) : undefined}
      />
      {past.length > 0 ? (
        <Section
          title="Past"
          meetings={past}
          personas={personas}
          role={role}
          onDelete={showDelete ? (id) => deleteMut.mutate(id) : undefined}
        />
      ) : null}
    </div>
  );
}

function Section({
  title,
  meetings,
  personas,
  role,
  onDelete,
}: {
  title: string;
  meetings: ScheduledMeeting[];
  personas: DemoPersona[];
  role: string;
  onDelete?: (id: number) => void;
}) {
  if (meetings.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[color:var(--color-primary)]" /> {title}
        </CardTitle>
        <CardDescription>{meetings.length} meeting{meetings.length !== 1 ? "s" : ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {meetings.map((m) => {
            const withLabel = meetingWithLabel(m, personas, role);
            return (
              <li
                key={m.id}
                className="rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{m.title}</div>
                    {withLabel ? (
                      <div className="text-xs text-[color:var(--color-fg-muted)]">
                        With {withLabel}
                      </div>
                    ) : null}
                    <div className="text-xs text-[color:var(--color-fg-muted)]">
                      {formatRange(m.starts_at, m.ends_at)}
                    </div>
                    {m.agenda ? (
                      <div className="mt-1 line-clamp-2 text-xs text-[color:var(--color-fg-muted)]">
                        {m.agenda}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={statusTone(m.status)} size="sm">
                      {m.status}
                    </Badge>
                    {m.teams_join_url ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={m.teams_join_url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" /> Join
                        </a>
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <button
                        onClick={() => onDelete(m.id)}
                        className="text-[color:var(--color-fg-faint)] hover:text-[color:var(--color-danger)]"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function statusTone(status: string): "neutral" | "warning" | "success" | "danger" {
  if (status === "confirmed") return "success";
  if (status === "cancelled") return "danger";
  if (status === "proposed") return "warning";
  return "neutral";
}

function meetingWithLabel(
  meeting: ScheduledMeeting,
  personas: DemoPersona[],
  role: string,
): string | null {
  const preferredPerson =
    role === "mentor"
      ? personas.find(
          (persona) =>
            persona.role === "newcomer" &&
            persona.newcomer_id === meeting.newcomer_id,
        )
      : personas.find(
          (persona) =>
            persona.role === "mentor" &&
            persona.user_id === meeting.organizer_user_id,
        );

  return preferredPerson?.name ?? meeting.attendee_emails?.[0] ?? null;
}

function formatRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const sH = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const eH = end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `${date} · ${sH} → ${eH}` : `${date} ${sH} → ${end.toLocaleDateString()} ${eH}`;
}
