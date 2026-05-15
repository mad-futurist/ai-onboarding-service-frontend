"use client";

import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";

import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { CountUp } from "@/components/shared/CountUp";
import { Badge } from "@/components/ui/badge";
import { StatusDonut, type StatusDonutSegment } from "./StatusDonut";

interface ProgressHeroProps {
  completedCount: number;
  inProgressCount: number;
  blockedCount: number;
  todoCount: number;
  /** Optional override for the phase label shown on the right. */
  phaseLabel?: string;
  /** Optional short streak / momentum hint, e.g. "3 tasks done this week". */
  hint?: string;
}

export function ProgressHero({
  completedCount,
  inProgressCount,
  blockedCount,
  todoCount,
  phaseLabel,
  hint,
}: ProgressHeroProps) {
  const total = completedCount + inProgressCount + blockedCount + todoCount;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const segments: StatusDonutSegment[] = [
    { key: "done", label: "Done", value: completedCount, color: "url(#donut-ai)" },
    {
      key: "in_progress",
      label: "In progress",
      value: inProgressCount,
      color: "var(--color-primary)",
    },
    {
      key: "blocked",
      label: "Blocked",
      value: blockedCount,
      color: "var(--color-danger)",
    },
    {
      key: "todo",
      label: "Todo",
      value: todoCount,
      color: "var(--color-border-strong)",
    },
  ];

  const phase = phaseLabel ??
    (pct >= 66
      ? "Phase 3 — Independent work"
      : pct >= 33
        ? "Phase 2 — Own a feature"
        : "Phase 1 — First PR");

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[24px] border border-[color:var(--color-border)] bg-white px-6 py-7 sm:px-8 sm:py-8 shadow-[var(--shadow-card)]"
    >
      <AuroraBackground intensity="hero" />
      <div className="bg-grid-faint absolute inset-0 opacity-30" aria-hidden />

      <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <StatusDonut
            segments={segments}
            size={196}
            stroke={18}
            center={
              <div className="text-center">
                <div className="ai-gradient-text text-4xl font-semibold tabular-nums leading-none">
                  <CountUp value={pct} suffix="%" />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                  Onboarding complete
                </div>
              </div>
            }
          />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)] backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Where you are right now
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {phase}
          </h1>
          <p className="max-w-md text-sm text-[color:var(--color-fg-muted)]">
            Progress without the LMS vibe — just what you&apos;ve done, what&apos;s next,
            and where to look when something feels off.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <LegendChip
              dot="url(#donut-ai)"
              gradient
              label={`${completedCount} done`}
            />
            <LegendChip
              dot="var(--color-primary)"
              label={`${inProgressCount} in progress`}
            />
            {blockedCount > 0 ? (
              <LegendChip
                dot="var(--color-danger)"
                label={`${blockedCount} blocked`}
              />
            ) : null}
            <LegendChip
              dot="var(--color-border-strong)"
              label={`${todoCount} todo`}
            />
          </div>
          {hint ? (
            <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)]">
              <Flame className="h-3 w-3 text-[color:var(--color-primary)]" />
              {hint}
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}

function LegendChip({
  dot,
  label,
  gradient = false,
}: {
  dot: string;
  label: string;
  gradient?: boolean;
}) {
  return (
    <Badge tone="neutral" size="sm">
      <span
        className="mr-1 inline-block h-2 w-2 rounded-full"
        style={
          gradient
            ? {
                background:
                  "linear-gradient(135deg, var(--color-ai-from), var(--color-ai-via) 55%, var(--color-ai-to))",
              }
            : { background: dot }
        }
        aria-hidden
      />
      {label}
    </Badge>
  );
}
