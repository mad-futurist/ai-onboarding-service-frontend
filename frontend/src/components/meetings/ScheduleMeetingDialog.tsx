"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Save, Sparkles, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { createMeeting } from "@/services/meetings";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import type { AISignal, ID } from "@/types";

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill from a signal: title + agenda + signal_id. */
  signal?: AISignal | null;
  /** Pre-fill the newcomer for which the meeting is scheduled. */
  newcomerId?: ID | null;
  taskId?: ID | null;
  planId?: ID | null;
  defaultTitle?: string;
}

const DURATIONS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "1 hour", minutes: 60 },
];

function toLocalInputValue(d: Date): string {
  // yyyy-MM-ddTHH:mm in the user's local timezone
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function defaultStart(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  signal,
  newcomerId,
  taskId,
  planId,
  defaultTitle,
}: ScheduleMeetingDialogProps) {
  const qc = useQueryClient();
  const { mentorId } = useDemo();

  const [title, setTitle] = React.useState("");
  const [agenda, setAgenda] = React.useState("");
  const [startAt, setStartAt] = React.useState(toLocalInputValue(defaultStart()));
  const [duration, setDuration] = React.useState(30);
  const [teamsUrl, setTeamsUrl] = React.useState("");
  const [attendees, setAttendees] = React.useState("");

  React.useEffect(() => {
    if (open) {
      const seedTitle = signal
        ? `Mentor sync · ${signal.title}`
        : defaultTitle ?? "Mentor sync";
      const seedAgenda = signal
        ? `Talk through the signal "${signal.title}".\n\nEvidence:\n${signal.evidence ?? "(no evidence)"}\n\nSuggested action:\n${signal.suggested_action ?? "(none)"}`
        : "";
      setTitle(seedTitle);
      setAgenda(seedAgenda);
      setStartAt(toLocalInputValue(defaultStart()));
      setDuration(30);
      setTeamsUrl("");
      setAttendees("");
    }
  }, [open, signal, defaultTitle]);

  const createMut = useMutation({
    mutationFn: () => {
      const starts = new Date(startAt);
      const ends = new Date(starts.getTime() + duration * 60_000);
      return createMeeting({
        title: title.trim(),
        agenda: agenda.trim() || null,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        newcomer_id: newcomerId ?? signal?.newcomer_id ?? null,
        organizer_user_id: mentorId ?? null,
        plan_id: planId ?? null,
        task_id: taskId ?? null,
        signal_id: signal?.id ?? null,
        teams_join_url: teamsUrl.trim() || null,
        attendee_emails: attendees
          .split(/[,;\n]/)
          .map((e) => e.trim())
          .filter(Boolean),
        status: "proposed",
      });
    },
    onSuccess: () => {
      toast.success("Meeting scheduled");
      qc.invalidateQueries({ queryKey: ["meetings"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error("Schedule failed", { description: toApiError(err).message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[color:var(--color-primary)]" /> Schedule a meeting
          </DialogTitle>
          <DialogDescription>
            Phase 1 ships a basic scheduler. Microsoft Graph / Teams OAuth will be wired in Phase 4 — for now you
            can paste an existing Teams join URL.
          </DialogDescription>
        </DialogHeader>

        {signal ? (
          <div className="rounded-md border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)]/40 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3 w-3" /> Pre-filled from signal
            </div>
            <div className="mt-0.5 text-[color:var(--color-fg-muted)]">{signal.title}</div>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="meet-title">Title</Label>
            <Input id="meet-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meet-agenda">Agenda</Label>
            <Textarea id="meet-agenda" rows={4} value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="meet-start">Start (local)</Label>
              <Input
                id="meet-start"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d.minutes}
                    type="button"
                    onClick={() => setDuration(d.minutes)}
                    className="text-xs"
                  >
                    <Badge tone={duration === d.minutes ? "brand" : "neutral"} size="sm">
                      {d.label}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meet-teams">Teams join URL (optional)</Label>
            <Input
              id="meet-teams"
              placeholder="https://teams.microsoft.com/l/meetup-join/…"
              value={teamsUrl}
              onChange={(e) => setTeamsUrl(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meet-attendees">Attendee emails (optional, comma or newline separated)</Label>
            <Textarea
              id="meet-attendees"
              rows={2}
              placeholder="alice@example.com, bob@example.com"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={() => createMut.mutate()} disabled={!title.trim() || createMut.isPending}>
            <Save className="h-4 w-4" /> {createMut.isPending ? "Scheduling…" : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
