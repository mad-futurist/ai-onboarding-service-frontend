"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CircleDashed, AlertTriangle, ChevronRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/shared/ProgressRing";
import type { OnboardingTask } from "@/types";

interface PlanJourneyTimelineProps {
  tasks: OnboardingTask[];
}

interface WeekStop {
  week: number;
  tasks: OnboardingTask[];
  completed: number;
  blocked: number;
  phaseId: 1 | 2 | 3;
}

const PHASE_LABEL: Record<1 | 2 | 3, string> = {
  1: "First 30 days",
  2: "Days 31–60",
  3: "Days 61–90",
};

function phaseOf(week: number): 1 | 2 | 3 {
  const day = week * 7;
  if (day <= 30) return 1;
  if (day <= 60) return 2;
  return 3;
}

export function PlanJourneyTimeline({ tasks }: PlanJourneyTimelineProps) {
  const stops = React.useMemo<WeekStop[]>(() => {
    const map = new Map<number, OnboardingTask[]>();
    for (const t of tasks) {
      const wk = t.week_number ?? Math.max(1, Math.ceil((t.day_number ?? 1) / 7));
      const list = map.get(wk) ?? [];
      list.push(t);
      map.set(wk, list);
    }
    const out: WeekStop[] = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([week, ts]) => ({
        week,
        tasks: ts,
        completed: ts.filter((t) => t.status === "done").length,
        blocked: ts.filter((t) => t.status === "blocked").length,
        phaseId: phaseOf(week),
      }));
    return out;
  }, [tasks]);

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const overallPct = totalCount ? (completedCount / totalCount) * 100 : 0;

  const currentWeek = React.useMemo(() => {
    const firstNonDone = stops.find((s) => s.completed < s.tasks.length);
    return firstNonDone?.week ?? stops[stops.length - 1]?.week ?? 1;
  }, [stops]);

  const [userPickedWeek, setUserPickedWeek] = React.useState<number | null>(null);
  const selectedWeek = userPickedWeek ?? currentWeek;

  const selected = stops.find((s) => s.week === selectedWeek) ?? stops[0];

  if (stops.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white p-10 text-center text-sm text-[color:var(--color-fg-muted)]">
        No tasks scheduled yet — your mentor is still preparing the journey.
      </div>
    );
  }

  const positionOf = (week: number) => {
    if (stops.length === 1) return 50;
    const min = stops[0].week;
    const max = stops[stops.length - 1].week;
    return ((week - min) / (max - min)) * 100;
  };

  const playheadPct = positionOf(currentWeek);

  return (
    <section
      className="relative overflow-hidden rounded-[20px] border border-[color:var(--color-border)] bg-white p-5 sm:p-7 shadow-[var(--shadow-card)]"
      data-demo-id="newcomer-plan-journey"
    >
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            Journey
          </div>
          <h2 className="text-base font-semibold tracking-tight">
            Your 90-day path, week by week
          </h2>
          <p className="text-xs text-[color:var(--color-fg-muted)]">
            Click a week to expand. The pulsing dot marks where you are now.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-white/80 px-3 py-1.5 backdrop-blur">
          <ProgressRing value={overallPct} size={32} stroke={4} />
          <div className="text-xs">
            <div className="font-semibold tabular-nums">
              {Math.round(overallPct)}%
            </div>
            <div className="text-[10px] text-[color:var(--color-fg-muted)]">
              {completedCount}/{totalCount} done
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-7 mb-4 h-3 rounded-full bg-[color:var(--color-surface-muted)] overflow-hidden">
        {([1, 2, 3] as const).map((p) => {
          const phaseStops = stops.filter((s) => s.phaseId === p);
          if (phaseStops.length === 0) return null;
          const start = positionOf(phaseStops[0].week);
          const end = positionOf(phaseStops[phaseStops.length - 1].week);
          const width = Math.max(2, end - start);
          return (
            <div
              key={p}
              className="absolute inset-y-0 ai-gradient-soft"
              style={{ left: `${start}%`, width: `${width}%`, opacity: 0.55 }}
              aria-hidden
            />
          );
        })}
        <motion.div
          className="absolute inset-y-0 left-0 ai-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${overallPct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          aria-hidden
          className="absolute -top-1 h-5 w-px"
          style={{ left: `${playheadPct}%` }}
        >
          <span className="absolute -left-1 top-0 inline-block h-5 w-2 rounded-full bg-white shadow-[var(--shadow-ai)]" />
          <span className="absolute -left-1.5 top-1 inline-block h-3 w-3 rounded-full bg-[color:var(--color-primary)] animate-[signal-pulse_2.4s_ease-in-out_infinite]" />
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 -mx-1">
        <div className="flex min-w-full items-stretch gap-2 px-1">
          {stops.map((s) => {
            const pct = s.tasks.length ? (s.completed / s.tasks.length) * 100 : 0;
            const isCurrent = s.week === currentWeek;
            const isActive = s.week === selectedWeek;
            const tone: "success" | "ai" | "brand" = s.blocked > 0
              ? "brand"
              : pct === 100
                ? "success"
                : "ai";
            return (
              <motion.button
                key={s.week}
                type="button"
                onClick={() => setUserPickedWeek(s.week)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "relative flex min-w-[120px] flex-1 flex-col items-center gap-1 rounded-[14px] border px-3 py-3 text-center transition-colors",
                  isActive
                    ? "border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] shadow-[var(--shadow-card)]"
                    : "border-[color:var(--color-border)] bg-white hover:border-[color:var(--color-primary-ring)]",
                )}
                data-active={isActive ? "true" : undefined}
              >
                {isCurrent ? (
                  <span className="absolute -top-1.5 right-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                    <span className="h-1 w-1 rounded-full bg-white animate-[signal-pulse_2.4s_ease-in-out_infinite]" />
                    now
                  </span>
                ) : null}
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  Week {s.week}
                </div>
                <ProgressRing value={pct} size={36} stroke={4} tone={tone} />
                <div className="text-[11px] text-[color:var(--color-fg-muted)] tabular-nums">
                  {s.completed}/{s.tasks.length}
                </div>
                {s.blocked > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[color:var(--color-danger-fg)]">
                    <AlertTriangle className="h-2.5 w-2.5" /> {s.blocked}
                  </span>
                ) : null}
                <div className="mt-0.5 text-[9px] uppercase tracking-wider text-[color:var(--color-fg-faint)]">
                  {PHASE_LABEL[s.phaseId]}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.week}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
                  Week {selected.week} · {PHASE_LABEL[selected.phaseId]}
                </div>
                <div className="text-xs text-[color:var(--color-fg-muted)]">
                  {selected.completed} of {selected.tasks.length} tasks complete
                  {selected.blocked > 0 ? ` · ${selected.blocked} blocked` : ""}
                </div>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {selected.tasks.map((t, index) => (
                <JourneyTaskRow key={t.id} task={t} index={index} />
              ))}
              {selected.tasks.length === 0 ? (
                <li className="text-xs text-[color:var(--color-fg-muted)]">
                  Nothing scheduled for this week.
                </li>
              ) : null}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function JourneyTaskRow({ task, index }: { task: OnboardingTask; index: number }) {
  const Icon = task.status === "done" ? Check : task.status === "blocked" ? AlertTriangle : CircleDashed;
  const tone =
    task.status === "done"
      ? "text-[color:var(--color-success)]"
      : task.status === "blocked"
        ? "text-[color:var(--color-danger)]"
        : "text-[color:var(--color-fg-faint)]";
  return (
    <li>
      <Link
        href={`/newcomer/tasks/${task.id}`}
        data-demo-id={index === 0 ? "newcomer-plan-first-task" : undefined}
        className="flex items-center gap-3 rounded-lg border border-transparent bg-white/60 px-3 py-2 hover:border-[color:var(--color-primary-ring)] hover:bg-white"
      >
        <Icon className={cn("h-4 w-4 shrink-0", tone)} />
        <div className={cn("min-w-0 flex-1", task.status === "done" && "line-through text-[color:var(--color-fg-muted)]")}>
          <div className="text-sm text-[color:var(--color-fg)] truncate">{task.title}</div>
          {task.description ? (
            <div className="text-xs text-[color:var(--color-fg-muted)] line-clamp-1">
              {task.description}
            </div>
          ) : null}
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
      </Link>
    </li>
  );
}
