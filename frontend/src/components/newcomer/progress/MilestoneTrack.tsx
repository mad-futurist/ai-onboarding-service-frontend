"use client";

import { motion } from "framer-motion";
import { Trophy, Flag, Rocket } from "lucide-react";

import type { OnboardingTask } from "@/types";

interface MilestoneTrackProps {
  tasks: OnboardingTask[];
}

interface PhaseStats {
  key: "p1" | "p2" | "p3";
  label: string;
  range: string;
  icon: typeof Flag;
  done: number;
  total: number;
}

export function MilestoneTrack({ tasks }: MilestoneTrackProps) {
  const phases = computePhases(tasks);
  const grandTotal = phases.reduce((acc, p) => acc + p.total, 0);
  const grandDone = phases.reduce((acc, p) => acc + p.done, 0);
  const overallPct = grandTotal > 0 ? (grandDone / grandTotal) * 100 : 0;

  return (
    <section className="rounded-[18px] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            <Trophy className="h-3 w-3" /> Milestones
          </div>
          <div className="mt-0.5 text-sm font-semibold tracking-tight">
            30 / 60 / 90 day path
          </div>
        </div>
        <div className="text-xs text-[color:var(--color-fg-muted)] tabular-nums">
          {Math.round(overallPct)}% overall
        </div>
      </div>

      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallPct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 ai-gradient rounded-full"
        />
        <div className="absolute inset-y-0 left-1/3 w-px bg-white/80" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-white/80" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {phases.map((p) => {
          const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
          const Icon = p.icon;
          return (
            <div
              key={p.key}
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-fg)]">
                  <Icon className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
                  {p.label}
                </div>
                <span className="text-[10px] text-[color:var(--color-fg-subtle)]">
                  {p.range}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-base font-semibold tabular-nums">
                  {p.done}
                  <span className="text-xs text-[color:var(--color-fg-muted)]">
                    /{p.total}
                  </span>
                </span>
                <span className="ai-gradient-text text-xs font-semibold tabular-nums">
                  {pct}%
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full ai-gradient"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function computePhases(tasks: OnboardingTask[]): PhaseStats[] {
  const phaseOf = (t: OnboardingTask): PhaseStats["key"] | null => {
    if (t.day_number != null) {
      if (t.day_number <= 30) return "p1";
      if (t.day_number <= 60) return "p2";
      if (t.day_number <= 90) return "p3";
      return "p3";
    }
    if (t.week_number != null) {
      if (t.week_number <= 4) return "p1";
      if (t.week_number <= 8) return "p2";
      return "p3";
    }
    return null;
  };

  const totals: Record<PhaseStats["key"], { done: number; total: number }> = {
    p1: { done: 0, total: 0 },
    p2: { done: 0, total: 0 },
    p3: { done: 0, total: 0 },
  };

  for (const t of tasks) {
    const k = phaseOf(t);
    if (!k) continue;
    totals[k].total += 1;
    if (t.status === "done") totals[k].done += 1;
  }

  return [
    {
      key: "p1",
      label: "Phase 1 · First PR",
      range: "Days 1–30",
      icon: Flag,
      ...totals.p1,
    },
    {
      key: "p2",
      label: "Phase 2 · Own a feature",
      range: "Days 31–60",
      icon: Rocket,
      ...totals.p2,
    },
    {
      key: "p3",
      label: "Phase 3 · Independent",
      range: "Days 61–90",
      icon: Trophy,
      ...totals.p3,
    },
  ];
}
