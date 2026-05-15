"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, CircleDashed, Plus, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { JourneyPeriod, NewcomerJourney } from "@/types";

interface PeriodSwitcherProps {
  journey: NewcomerJourney;
  activePeriodId?: number | null;
  onAddPeriod?: () => void;
  className?: string;
}

export function PeriodSwitcher({
  journey,
  activePeriodId,
  onAddPeriod,
  className,
}: PeriodSwitcherProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "sticky top-2 z-30 rounded-2xl border border-[color:var(--color-border)] bg-white/80 px-2 py-2 shadow-[var(--shadow-card)] backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        <div className="hidden shrink-0 px-3 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)] sm:block">
          Journey
        </div>
        <div className="hidden h-5 w-px shrink-0 bg-[color:var(--color-border)] sm:block" />

        {journey.periods.map((p) => (
          <PeriodPill
            key={p.id}
            period={p}
            active={activePeriodId === p.id}
            reduce={!!reduce}
          />
        ))}

        {onAddPeriod ? (
          <button
            type="button"
            onClick={onAddPeriod}
            className={cn(
              "ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-[color:var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-fg-muted)] transition",
              "hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/60 hover:text-[color:var(--color-primary-active)]",
            )}
          >
            <Plus className="h-3.5 w-3.5" /> Period
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PeriodPill({
  period,
  active,
  reduce,
}: {
  period: JourneyPeriod;
  active: boolean;
  reduce: boolean;
}) {
  const icon =
    period.status === "approved" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--color-success)]" />
    ) : period.status === "draft" ? (
      <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
    ) : (
      <CircleDashed className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
    );

  const href = period.plan_id ? `/mentor/plan-generator/${period.plan_id}` : "#";

  const inner = (
    <span className="relative z-10 inline-flex items-center gap-2">
      {icon}
      <span className="text-xs font-medium">
        <span className="text-[color:var(--color-fg-subtle)]">P{period.index} ·</span>{" "}
        <span className={cn(active ? "text-[color:var(--color-primary-active)]" : "text-[color:var(--color-fg)]")}>
          {period.label}
        </span>
      </span>
      {period.tasks_total > 0 ? (
        <span className="rounded-full bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-fg-muted)]">
          {period.tasks_done}/{period.tasks_total}
        </span>
      ) : null}
    </span>
  );

  return (
    <Link
      href={href}
      className={cn(
        "relative shrink-0 rounded-full px-3 py-1.5 transition",
        active ? "" : "hover:bg-[color:var(--color-surface-muted)]",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active ? (
        <motion.span
          layoutId="period-pill-active"
          className="absolute inset-0 rounded-full bg-[color:var(--color-primary-soft)] ring-1 ring-[color:var(--color-primary-ring)]"
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }
          }
        />
      ) : null}
      {inner}
    </Link>
  );
}
