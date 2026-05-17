"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Plus, Video } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MeetingsList } from "@/components/meetings/MeetingsList";
import { ScheduleMeetingDialog } from "@/components/meetings/ScheduleMeetingDialog";

import { listMeetings } from "@/services/meetings";
import { useDemo } from "@/providers/demo-provider";
import { cn } from "@/lib/utils";
import type { ScheduledMeeting } from "@/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function NewcomerCalendarPage() {
  const { newcomerId } = useDemo();
  const [meetingOpen, setMeetingOpen] = React.useState(false);
  const [selectedStartAt, setSelectedStartAt] = React.useState<Date | null>(null);

  const meetings = useQuery({
    queryKey: ["meetings", "newcomer", newcomerId],
    queryFn: () => listMeetings({ newcomer_id: newcomerId ?? undefined }),
    enabled: !!newcomerId,
  });

  const openMeetingDialog = (day?: Date) => {
    const start = day ? new Date(day) : defaultMeetingStart();
    start.setHours(start.getHours() || 10, 0, 0, 0);
    setSelectedStartAt(start);
    setMeetingOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Calendar"
        title="Meetings calendar"
        description="Your mentor sessions and syncs in one place."
        actions={
          <Button
            variant="ai"
            onClick={() => openMeetingDialog()}
            data-demo-id="newcomer-calendar-add"
          >
            <Plus className="h-4 w-4" /> Add meeting
          </Button>
        }
      />

      <MeetingsList
        meetings={meetings.data ?? []}
        isLoading={meetings.isLoading}
        emptyTitle="No meetings yet"
        emptyDescription="Your mentor will schedule sessions here when needed."
      />

      <CalendarBoard
        meetings={meetings.data ?? []}
        isLoading={meetings.isLoading}
        onAddMeeting={openMeetingDialog}
      />

      <ScheduleMeetingDialog
        open={meetingOpen}
        onOpenChange={setMeetingOpen}
        newcomerId={newcomerId}
        defaultStartAt={selectedStartAt}
      />
    </div>
  );
}

function CalendarBoard({
  meetings,
  isLoading,
  onAddMeeting,
}: {
  meetings: ScheduledMeeting[];
  isLoading: boolean;
  onAddMeeting: (day: Date) => void;
}) {
  const today = React.useMemo(() => new Date(), []);
  const days = React.useMemo(() => buildMonthDays(today), [today]);
  const meetingsByDate = React.useMemo(() => groupMeetingsByDate(meetings), [meetings]);
  const monthLabel = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <section
      data-demo-id="newcomer-calendar-grid"
      className="rounded-lg border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-col gap-3 border-b border-[color:var(--color-border)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-[color:var(--color-fg)]">
            <CalendarDays className="h-4 w-4 text-[color:var(--color-primary)]" /> {monthLabel}
          </h2>
          <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
            Meetings scheduled for this month.
          </p>
        </div>
        <Badge tone="ai" size="lg">
          {meetings.length} meeting{meetings.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-px bg-[color:var(--color-border)] p-px">
          {Array.from({ length: 42 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-none" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-center text-xs font-medium text-[color:var(--color-fg-muted)]">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-px bg-[color:var(--color-border)] sm:grid-cols-7">
            {days.map((day) => {
              const key = dateKey(day.date);
              const dayMeetings = meetingsByDate.get(key) ?? [];

              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-32 bg-white p-3",
                    !day.inMonth && "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md text-sm font-semibold text-[color:var(--color-fg)]">
                      {day.date.getDate()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Add meeting"
                      onClick={() => onAddMeeting(day.date)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {dayMeetings.slice(0, 3).map((meeting) => (
                      <CalendarItem key={meeting.id} label={meeting.title} time={formatTime(meeting.starts_at)} />
                    ))}
                    {dayMeetings.length > 3 ? (
                      <div className="text-[11px] text-[color:var(--color-fg-muted)]">
                        +{dayMeetings.length - 3} more
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function CalendarItem({ label, time }: { label: string; time: string }) {
  return (
    <div className="rounded-md border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] px-2 py-1.5 text-xs text-[color:var(--color-primary-active)]">
      <div className="flex items-center gap-1.5">
        <Video className="h-3 w-3 shrink-0" />
        <span className="truncate font-medium">{label}</span>
      </div>
      <div className="mt-0.5 text-[11px] opacity-80">{time}</div>
    </div>
  );
}

function buildMonthDays(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  const dayOffset = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - dayOffset);

  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      inMonth: date.getMonth() === anchor.getMonth(),
    };
  });
}

function groupMeetingsByDate(meetings: ScheduledMeeting[]) {
  const grouped = new Map<string, ScheduledMeeting[]>();
  for (const meeting of meetings) {
    const key = dateKey(new Date(meeting.starts_at));
    const list = grouped.get(key) ?? [];
    list.push(meeting);
    grouped.set(key, list);
  }
  return grouped;
}

function dateKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function defaultMeetingStart() {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  return start;
}
