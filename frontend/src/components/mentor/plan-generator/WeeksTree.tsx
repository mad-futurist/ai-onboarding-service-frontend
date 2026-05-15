"use client";

import Link from "next/link";
import { ChevronRight, CalendarDays, Layers, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OnboardingTask, Sprint, Week, ID } from "@/types";

interface WeeksTreeProps {
  planId: ID;
  weeks: Week[];
  sprints?: Sprint[];
  tasks: OnboardingTask[];
  onAddWeek?: () => void;
  onScaffoldFromTasks?: () => void;
  scaffolding?: boolean;
}

interface DisplayWeek {
  key: string;
  // Either a real Week (clickable into the week detail) or a synthetic one
  // derived from task.week_number when scaffolding hasn't run yet.
  real?: Week;
  index: number;
  title: string;
  summary: string | null;
  sprint_id: ID | null;
  taskCount: number;
}

export function WeeksTree({
  planId,
  weeks,
  sprints,
  tasks,
  onAddWeek,
  onScaffoldFromTasks,
  scaffolding,
}: WeeksTreeProps) {
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

  // Build a unified list combining real Week rows + virtual ones derived from
  // task.week_number that aren't already represented.
  const realByIndex = new Map<number, Week>();
  for (const w of weeks) realByIndex.set(w.index, w);

  const virtualNumbers = Array.from(tasksByWeekNumber.keys())
    .filter((n) => !realByIndex.has(n))
    .sort((a, b) => a - b);

  const displayWeeks: DisplayWeek[] = [
    ...weeks.map<DisplayWeek>((w) => ({
      key: `real-${w.id}`,
      real: w,
      index: w.index,
      title: w.title,
      summary: w.summary,
      sprint_id: w.sprint_id,
      taskCount:
        (tasksByWeekId.get(w.id) ?? []).length +
        (tasksByWeekNumber.get(w.index) ?? []).length,
    })),
    ...virtualNumbers.map<DisplayWeek>((n) => ({
      key: `virtual-${n}`,
      index: n,
      title: `Week ${n}`,
      summary: null,
      sprint_id: null,
      taskCount: (tasksByWeekNumber.get(n) ?? []).length,
    })),
  ].sort((a, b) => a.index - b.index);

  const groupedBySprint =
    sprints && sprints.length
      ? sprints.map((s) => ({
          sprint: s,
          weeks: displayWeeks.filter((w) => w.sprint_id === s.id),
        }))
      : null;

  const orphanWeeks = sprints?.length
    ? displayWeeks.filter((w) => w.sprint_id == null)
    : displayWeeks;

  const hasVirtual = virtualNumbers.length > 0;

  return (
    <div className="space-y-4">
      {hasVirtual && onScaffoldFromTasks ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[color:var(--color-warning-soft)] bg-[color:var(--color-warning-soft)]/60 px-3 py-2.5 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-[color:var(--color-warning-fg)]" />
          <div className="flex-1 min-w-[180px]">
            <p className="font-medium text-[color:var(--color-fg)]">
              {virtualNumbers.length} week{virtualNumbers.length > 1 ? "s" : ""} aren&apos;t scaffolded yet
            </p>
            <p className="text-[11px] text-[color:var(--color-fg-muted)]">
              They show up here from task week numbers — click below to make them editable (titles, summaries, regenerate, drag-drop).
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ai"
            onClick={onScaffoldFromTasks}
            disabled={scaffolding}
          >
            {scaffolding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Layers className="h-3.5 w-3.5" />
            )}
            {scaffolding ? "Scaffolding…" : "Scaffold weeks"}
          </Button>
        </div>
      ) : null}

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
              <WeekRow key={w.key} planId={planId} week={w} />
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
              <WeekRow key={w.key} planId={planId} week={w} />
            ))}
          </ul>
        </section>
      ) : null}

      {!displayWeeks.length ? (
        <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-[color:var(--color-fg)]">
            No weeks yet
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
            The plan has no tasks with a week number. Generate or regenerate the plan to scaffold tasks per week.
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

function WeekRow({ planId, week }: { planId: ID; week: DisplayWeek }) {
  const isVirtual = !week.real;
  const inner = (
    <div className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[color:var(--color-surface-muted)]">
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:var(--color-surface-muted)] text-[11px] font-semibold text-[color:var(--color-fg-muted)]">
          W{week.index}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-[color:var(--color-fg)]">
              {week.title}
            </span>
            {isVirtual ? (
              <Badge tone="warning" size="sm">
                pending scaffold
              </Badge>
            ) : null}
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
          {week.taskCount} task{week.taskCount === 1 ? "" : "s"}
        </span>
        {!isVirtual ? (
          <ChevronRight className="h-4 w-4 text-[color:var(--color-fg-faint)]" />
        ) : null}
      </div>
    </div>
  );

  if (isVirtual) {
    // Show but not clickable — scaffold first to make it editable.
    return <li className="opacity-90">{inner}</li>;
  }
  return (
    <li>
      <Link href={`/mentor/plan-generator/${planId}/week/${week.real!.id}`}>{inner}</Link>
    </li>
  );
}
