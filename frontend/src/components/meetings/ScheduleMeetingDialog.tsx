"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Save, Sparkles, UserRound, X } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createMeeting } from "@/services/meetings";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import type { AISignal, DemoPersona, ID } from "@/types";

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
  defaultStartAt?: Date | null;
}

interface MeetingSeed {
  key: string;
  title: string;
  agenda: string;
  startAt: string;
}

const DURATIONS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "1 hour", minutes: 60 },
];

function toLocalInputValue(d: Date): string {
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
  defaultStartAt,
}: ScheduleMeetingDialogProps) {
  const seed = React.useMemo(
    () => buildMeetingSeed(signal, defaultTitle, defaultStartAt),
    [signal, defaultTitle, defaultStartAt],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open ? (
          <ScheduleMeetingForm
            key={seed.key}
            seed={seed}
            signal={signal}
            newcomerId={newcomerId}
            taskId={taskId}
            planId={planId}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ScheduleMeetingForm({
  seed,
  signal,
  newcomerId,
  taskId,
  planId,
  onOpenChange,
}: {
  seed: MeetingSeed;
  signal?: AISignal | null;
  newcomerId?: ID | null;
  taskId?: ID | null;
  planId?: ID | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const {
    activePersona,
    mentorId: demoMentorId,
    newcomerId: demoNewcomerId,
    personas,
    role,
  } = useDemo();

  const newcomerOptions = React.useMemo(
    () =>
      personas.filter(
        (persona): persona is DemoPersona & { newcomer_id: ID } =>
          persona.role === "newcomer" && typeof persona.newcomer_id === "number",
      ),
    [personas],
  );
  const mentorOptions = React.useMemo(
    () => personas.filter((persona) => persona.role === "mentor"),
    [personas],
  );
  const fallbackNewcomerId =
    newcomerId ??
    signal?.newcomer_id ??
    (role === "newcomer" ? demoNewcomerId : null) ??
    newcomerOptions[0]?.newcomer_id ??
    null;
  const fallbackOrganizerUserId =
    (role === "mentor" ? demoMentorId : null) ??
    demoMentorId ??
    mentorOptions[0]?.user_id ??
    null;

  const [title, setTitle] = React.useState(seed.title);
  const [agenda, setAgenda] = React.useState(seed.agenda);
  const [startAt, setStartAt] = React.useState(seed.startAt);
  const [duration, setDuration] = React.useState(30);
  const [teamsUrl, setTeamsUrl] = React.useState("");
  const [attendees, setAttendees] = React.useState("");
  const [selectedNewcomerId, setSelectedNewcomerId] = React.useState(() =>
    toSelectValue(fallbackNewcomerId),
  );
  const [selectedOrganizerUserId, setSelectedOrganizerUserId] = React.useState(() =>
    toSelectValue(fallbackOrganizerUserId),
  );

  const effectiveSelectedNewcomerId =
    selectedNewcomerId || toSelectValue(fallbackNewcomerId);
  const effectiveSelectedOrganizerUserId =
    selectedOrganizerUserId || toSelectValue(fallbackOrganizerUserId);
  const targetNewcomerId =
    fromSelectValue(effectiveSelectedNewcomerId) ?? newcomerId ?? signal?.newcomer_id ?? null;
  const targetOrganizerUserId =
    fromSelectValue(effectiveSelectedOrganizerUserId) ?? demoMentorId ?? null;
  const selectedPartner =
    role === "mentor"
      ? newcomerOptions.find((persona) => String(persona.newcomer_id) === effectiveSelectedNewcomerId)
      : mentorOptions.find((persona) => String(persona.user_id) === effectiveSelectedOrganizerUserId);
  const missingParticipant = role === "mentor" ? !targetNewcomerId : !targetOrganizerUserId;

  const createMut = useMutation({
    mutationFn: () => {
      const starts = new Date(startAt);
      const ends = new Date(starts.getTime() + duration * 60_000);
      const attendeeEmails = uniqueEmails([
        selectedPartner?.email,
        ...attendees
          .split(/[,;\n]/)
          .map((e) => e.trim())
          .filter(Boolean),
      ]);
      return createMeeting({
        title: title.trim(),
        agenda: agenda.trim() || null,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        newcomer_id: targetNewcomerId,
        organizer_user_id: targetOrganizerUserId,
        created_by_user_id: activePersona?.user_id ?? null,
        plan_id: planId ?? null,
        task_id: taskId ?? null,
        signal_id: signal?.id ?? null,
        teams_join_url: teamsUrl.trim() || null,
        attendee_emails: attendeeEmails,
        status: "proposed",
      });
    },
    onSuccess: () => {
      toast.success("Meeting scheduled");
      qc.invalidateQueries({ queryKey: ["meetings"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error("Schedule failed", { description: toApiError(err).message }),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[color:var(--color-primary)]" /> Schedule a meeting
        </DialogTitle>
        <DialogDescription>Choose a participant, time, agenda, and optional Teams URL.</DialogDescription>
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
          <Input
            id="meet-title"
            data-demo-id="schedule-meeting-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meet-with">With</Label>
          <Select
            value={role === "mentor" ? effectiveSelectedNewcomerId : effectiveSelectedOrganizerUserId}
            onValueChange={role === "mentor" ? setSelectedNewcomerId : setSelectedOrganizerUserId}
            disabled={(role === "mentor" ? newcomerOptions : mentorOptions).length === 0}
          >
            <SelectTrigger id="meet-with">
              <UserRound className="h-4 w-4 text-[color:var(--color-fg-subtle)]" />
              <SelectValue placeholder={role === "mentor" ? "Choose a newcomer" : "Choose a mentor"} />
            </SelectTrigger>
            <SelectContent className="z-[90]">
              {role === "mentor"
                ? newcomerOptions.map((persona) => (
                    <SelectItem key={persona.newcomer_id} value={String(persona.newcomer_id)}>
                      {persona.name}
                    </SelectItem>
                  ))
                : mentorOptions.map((persona) => (
                    <SelectItem key={persona.user_id} value={String(persona.user_id)}>
                      {persona.name}
                    </SelectItem>
                  ))}
              {(role === "mentor" ? newcomerOptions : mentorOptions).length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-[color:var(--color-fg-muted)]">
                  No participants available
                </div>
              ) : null}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meet-agenda">Agenda</Label>
          <Textarea
            id="meet-agenda"
            data-demo-id="schedule-meeting-agenda"
            rows={4}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
          />
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
            placeholder="https://teams.microsoft.com/l/meetup-join/..."
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
        <Button
          onClick={() => createMut.mutate()}
          disabled={!title.trim() || missingParticipant || createMut.isPending}
          data-demo-id="schedule-meeting-submit"
        >
          <Save className="h-4 w-4" /> {createMut.isPending ? "Scheduling..." : "Schedule"}
        </Button>
      </DialogFooter>
    </>
  );
}

function toSelectValue(value: ID | null | undefined): string {
  return value ? String(value) : "";
}

function fromSelectValue(value: string): ID | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function uniqueEmails(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const value of values) {
    const email = value?.trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(email);
  }
  return emails;
}

function buildMeetingSeed(
  signal: AISignal | null | undefined,
  defaultTitle: string | undefined,
  defaultStartAt: Date | null | undefined,
): MeetingSeed {
  const start = defaultStartAt ?? defaultStart();
  const title = signal ? `Mentor sync - ${signal.title}` : defaultTitle ?? "Mentor sync";
  const agenda = signal
    ? `Talk through the signal "${signal.title}".\n\nEvidence:\n${signal.evidence ?? "(no evidence)"}\n\nSuggested action:\n${signal.suggested_action ?? "(none)"}`
    : "";

  return {
    key: `${signal?.id ?? "no-signal"}-${defaultTitle ?? "no-title"}-${start.toISOString()}`,
    title,
    agenda,
    startAt: toLocalInputValue(start),
  };
}
