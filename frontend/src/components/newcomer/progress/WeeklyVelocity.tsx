"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

import type { OnboardingTask } from "@/types";

interface WeeklyVelocityProps {
  tasks: OnboardingTask[];
  /** Weeks to display (defaults to 12). */
  weeks?: number;
}

interface WeekBucket {
  weekNumber: number;
  total: number;
  done: number;
}

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function WeeklyVelocity({ tasks, weeks = 12 }: WeeklyVelocityProps) {
  const buckets = bucketByWeek(tasks, weeks);
  const maxBucket = Math.max(...buckets.map((b) => b.total), 1);
  const totalDone = buckets.reduce((acc, b) => acc + b.done, 0);
  const currentWeek = buckets.findLast((b) => b.done > 0 || b.total > 0)?.weekNumber ?? 1;

  return (
    <section className="rounded-[18px] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            <TrendingUp className="h-3 w-3" /> Weekly velocity
          </div>
          <div className="mt-0.5 text-sm font-semibold tracking-tight">
            {totalDone} tasks shipped over {weeks} weeks
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            Current
          </div>
          <div className="ai-gradient-text text-sm font-semibold tabular-nums">
            W{currentWeek}
          </div>
        </div>
      </div>

      <div
        className="mt-4 flex h-24 items-end gap-1"
        role="img"
        aria-label={`Weekly velocity chart: ${totalDone} tasks completed across ${weeks} weeks`}
      >
        {buckets.map((b, i) => {
          const totalHeight = (b.total / maxBucket) * 100;
          const doneRatio = b.total > 0 ? b.done / b.total : 0;
          const isCurrent = b.weekNumber === currentWeek;
          return (
            <div
              key={b.weekNumber}
              className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1"
              title={`Week ${b.weekNumber} · ${b.done}/${b.total} done`}
            >
              <div className="relative w-full overflow-hidden rounded-md bg-[color:var(--color-surface-muted)]">
                <motion.div
                  initial={REDUCED_MOTION ? false : { height: 0, opacity: 0 }}
                  animate={{ height: `${Math.max(totalHeight, 4)}%`, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.035,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative w-full rounded-md"
                  style={{ minHeight: 4 }}
                >
                  <div className="absolute inset-0 rounded-md bg-[color:var(--color-border-strong)]/30" />
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-md ai-gradient"
                    style={{ height: `${doneRatio * 100}%` }}
                  />
                  {isCurrent ? (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-md ring-2 ring-[color:var(--color-primary-ring)]"
                    />
                  ) : null}
                </motion.div>
              </div>
              <span
                className={`text-[9px] font-medium tabular-nums ${
                  isCurrent
                    ? "text-[color:var(--color-primary-active)]"
                    : "text-[color:var(--color-fg-subtle)]"
                }`}
              >
                W{b.weekNumber}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function bucketByWeek(tasks: OnboardingTask[], weeks: number): WeekBucket[] {
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({
    weekNumber: i + 1,
    total: 0,
    done: 0,
  }));
  for (const t of tasks) {
    const wRaw = t.week_number;
    const w =
      wRaw && wRaw >= 1 && wRaw <= weeks
        ? wRaw
        : t.day_number
          ? Math.min(weeks, Math.max(1, Math.ceil(t.day_number / 7)))
          : null;
    if (w === null) continue;
    const b = buckets[w - 1];
    b.total += 1;
    if (t.status === "done") b.done += 1;
  }
  return buckets;
}
