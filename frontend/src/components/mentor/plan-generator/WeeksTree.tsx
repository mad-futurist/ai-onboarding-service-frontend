"use client";

import Link from "next/link";
import { ChevronRight, CalendarDays, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OnboardingTask, Sprint, Week, ID } from "@/types";

interface WeeksTreeProps {
  planId: ID;
  weeks: Week[];
  sprints?: Sprint[];
  tasks: OnboardingTask[];
  onAddWeek?: () => void;
}

export function WeeksTree({ planId, weeks, sprints, tasks, onAddWeek }: WeeksTreeProps) {
  const tasksByWeekId = new Map<ID, OnboardingTask[]>();
  const tasksByWeekNumber = new Map<number, OnboardingTask[]>();
  for (const t of tasks) {
    if (t.week_id != null) {
      const arr = tasksByWeekId.get(t.week_id) ?? [];
      arr.push(t);
      tasksByWeekId.set(t.week_id, arr);
    } else if (t.week_number != null) {
      const arr = tasksByWeekNumber.get(t.week_number) ?? [];
      arr.push(t);
      tasksByWeekNumber.set(t.week_number, arr);
    }
  }

  const groupedBySprint =
    sprints && sprints.length
      ? sprints.map((s) => ({
          sprint: s,
          weeks: weeks.filter((w) => w.sprint_id === s.id),
        }))
      : null;

  const orphanWeeks = sprints?.length
    ? weeks.filter((w) => w.sprint_id == null)
    : weeks;

  return (
    <div className="space-y-4">
      {groupedBySprint?.map(({ sprint, weeks: sprintWeeks }) => (
        <section
          key={sprint.id}
          className="rounded-[14px] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]"
        >
          <header className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
                <Layers className="h-3.5 w-3.5" />
              </span>
              <div>
                <div className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
                  Sprint {sprint.index} · {sprint.title}
                </div>
                {sprint.start_day != null && sprint.end_day != null ? (
                  <div className="text-[11px] text-[color:var(--color-fg-subtle)]">
                    Days {sprint.start_day}–{sprint.end_day}
                  </div>
                ) : null}
              </div>
            </div>
          </header>
          <ul className="divide-y divide-[color:var(--color-border)]">
            {sprintWeeks.map((w) => (
              <WeekRow
                key={w.id}
                planId={planId}
                week={w}
                count={
                  (tasksByWeekId.get(w.id) ?? tasksByWeekNumber.get(w.index) ?? []).length
                }
              />
            ))}
          </ul>
        </section>
      ))}

      {orphanWeeks.length ? (
        <section className="rounded-[14px] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          {groupedBySprint?.length ? (
            <header className="flex items-center gap-2 border-b border-[color:var(--color-border)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              <CalendarDays className="h-3.5 w-3.5" /> Other weeks
            </header>
          ) : null}
          <ul className="divide-y divide-[color:var(--color-border)]">
            {orphanWeeks.map((w) => (
              <WeekRow
                key={w.id}
                planId={planId}
                week={w}
                count={
                  (tasksByWeekId.get(w.id) ?? tasksByWeekNumber.get(w.index) ?? []).length
                }
              />
            ))}
          </ul>
        </section>
      ) : null}

      {!weeks.length ? (
        <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-[color:var(--color-fg)]">
            No weeks scaffolded yet
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
            The AI groups tasks by week_number from your plan. Create a week to start adding tasks manually.
          </p>
        </div>
      ) : null}

      {onAddWeek ? (
        <Button variant="outline" size="sm" onClick={onAddWeek}>
          + Add a week
        </Button>
      ) : null}
    </div>
  );
}

function WeekRow({ planId, week, count }: { planId: ID; week: Week; count: number }) {
  return (
    <li>
      <Link
        href={`/mentor/plan-generator/${planId}/week/${week.id}`}
        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[color:var(--color-surface-muted)]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:var(--color-surface-muted)] text-[11px] font-semibold text-[color:var(--color-fg-muted)]">
            W{week.index}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">
              {week.title}
            </div>
            {week.summary ? (
              <div className="line-clamp-1 text-xs text-[color:var(--color-fg-muted)]">
                {week.summary}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[color:var(--color-fg-subtle)]">
            {count} task{count === 1 ? "" : "s"}
          </span>
          <ChevronRight className="h-4 w-4 text-[color:var(--color-fg-faint)]" />
        </div>
      </Link>
    </li>
  );
}
