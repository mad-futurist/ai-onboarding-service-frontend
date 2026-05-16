"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  GitBranch,
  Plus,
  Sparkles,
  Wand2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JourneyPeriod, NewcomerJourney, PeriodStatus } from "@/types";

interface JourneyTimelineProps {
  journey: NewcomerJourney;
  activePeriodId?: number | null;
  onAddPeriod?: () => void;
  onAdjustPeriod?: (period: JourneyPeriod) => void;
  className?: string;
}

const STATUS_META: Record<
  PeriodStatus,
  {
    label: string;
    tone: "success" | "warning" | "neutral" | "ai";
    glow: string;
    ring: string;
    dot: string;
  }
> = {
  approved: {
    label: "Approved",
    tone: "success",
    glow: "shadow-[0_8px_28px_-12px_rgb(16_185_129_/_0.45)]",
    ring: "ring-1 ring-[color:var(--color-success)]/40",
    dot: "bg-[color:var(--color-success)]",
  },
  draft: {
    label: "Draft",
    tone: "ai",
    glow: "shadow-[0_8px_28px_-12px_rgb(249_115_22_/_0.45)]",
    ring: "ring-1 ring-[color:var(--color-primary-ring)]",
    dot: "bg-[color:var(--color-primary)]",
  },
  archived: {
    label: "Archived",
    tone: "neutral",
    glow: "",
    ring: "ring-1 ring-[color:var(--color-border)]",
    dot: "bg-[color:var(--color-fg-faint)]",
  },
  not_generated: {
    label: "Not generated",
    tone: "neutral",
    glow: "",
    ring: "ring-1 ring-dashed ring-[color:var(--color-border)]",
    dot: "bg-[color:var(--color-fg-faint)]",
  },
};

export function JourneyTimeline({
  journey,
  activePeriodId,
  onAddPeriod,
  onAdjustPeriod,
  className,
}: JourneyTimelineProps) {
  const reduce = useReducedMotion();
  const horizon = journey.horizon_days;
  const ticks = React.useMemo(() => buildTicks(horizon), [horizon]);

  // Map a `day` to a percentage on the rail.
  const pct = (day: number) => (Math.max(0, Math.min(horizon, day)) / horizon) * 100;

  const hasPeriods = journey.periods.length > 0;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[18px] border border-[color:var(--color-border)] bg-white p-5 sm:p-7",
        "shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {/* Subtle AI gradient wash in the background */}
      <div className="pointer-events-none absolute inset-0 ai-gradient-soft opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-48 bg-gradient-to-t from-white to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
              Journey
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-fg)]">
              {journey.newcomer_name}&apos;s onboarding journey
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
              {hasPeriods
                ? `${journey.periods.length} period${journey.periods.length === 1 ? "" : "s"} · horizon ${horizon} days`
                : "No period generated yet — start the first one to lay the path."}
            </p>
          </div>
          {onAddPeriod ? (
            <Button variant="ai" size="lg" onClick={onAddPeriod} className="shadow-[var(--shadow-ai)]">
              <Wand2 className="h-4 w-4" /> New period
            </Button>
          ) : null}
        </div>

        {/* Rail */}
        <div className="relative mt-10 pb-2">
          {/* Day labels above the rail */}
          <div className="relative h-5 select-none">
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute -translate-x-1/2 text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-fg-subtle)]"
                style={{ left: `${pct(t)}%` }}
              >
                D{t}
              </div>
            ))}
          </div>

          {/* The rail itself */}
          <div className="relative mt-1 h-2 rounded-full bg-gradient-to-r from-[color:var(--color-border)] via-[color:var(--color-border)] to-[color:var(--color-border)]">
            {/* Filled segments per period */}
            {journey.periods.map((p, idx) => {
              const meta = STATUS_META[p.status];
              return (
                <motion.div
                  key={p.id}
                  className={cn(
                    "absolute top-0 h-2 rounded-full",
                    p.status === "approved" && "bg-[color:var(--color-success)]",
                    p.status === "draft" && "ai-gradient",
                    p.status === "archived" && "bg-[color:var(--color-fg-faint)]",
                    p.status === "not_generated" && "bg-transparent",
                  )}
                  style={{
                    left: `${pct(p.start_day)}%`,
                    width: `${Math.max(2, pct(p.end_day) - pct(p.start_day))}%`,
                  }}
                  initial={reduce ? false : { scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.1 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  aria-label={`${p.label} · ${meta.label}`}
                />
              );
            })}

            {/* Tick dots */}
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[color:var(--color-border-strong)]"
                style={{ left: `${pct(t)}%` }}
              />
            ))}
          </div>

          {/* Connector lines from rail to cards */}
          <div className="relative mt-1 h-6">
            {journey.periods.map((p) => {
              const mid = (pct(p.start_day) + pct(p.end_day)) / 2;
              return (
                <div
                  key={p.id}
                  className="absolute top-0 w-px bg-[color:var(--color-border)]"
                  style={{ left: `${mid}%`, height: "100%" }}
                />
              );
            })}
          </div>
        </div>

        {/* Period cards (horizontal scroll on small screens, grid on large) */}
        <div className="-mx-2 mt-2 overflow-x-auto pb-1">
          <div
            className={cn(
              "flex min-w-full gap-3 px-2",
              journey.periods.length <= 3 && "lg:grid lg:grid-cols-4",
              journey.periods.length >= 4 && "lg:grid",
            )}
            style={
              journey.periods.length >= 4
                ? { gridTemplateColumns: `repeat(${journey.periods.length + 1}, minmax(0,1fr))` }
                : undefined
            }
          >
            {journey.periods.map((p, idx) => (
              <PeriodCard
                key={p.id}
                period={p}
                idx={idx}
                isActive={activePeriodId === p.id}
                reduce={!!reduce}
                onAdjustPeriod={onAdjustPeriod}
              />
            ))}
            <AddPeriodCard onClick={onAddPeriod} reduce={!!reduce} index={journey.periods.length} />
          </div>
        </div>
      </div>
    </section>
  );
}

function buildTicks(horizon: number): number[] {
  const step = horizon >= 180 ? 60 : 30;
  const out: number[] = [];
  for (let d = 0; d <= horizon; d += step) out.push(d);
  if (out[out.length - 1] !== horizon) out.push(horizon);
  return out;
}

function PeriodCard({
  period,
  idx,
  isActive,
  reduce,
  onAdjustPeriod,
}: {
  period: JourneyPeriod;
  idx: number;
  isActive: boolean;
  reduce: boolean;
  onAdjustPeriod?: (period: JourneyPeriod) => void;
}) {
  const meta = STATUS_META[period.status];
  const progress = period.tasks_total
    ? Math.round((period.tasks_done / period.tasks_total) * 100)
    : 0;

  const content = (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -3 }}
      className={cn(
        "group relative min-w-[220px] rounded-[16px] border bg-white p-4 transition-all",
        meta.ring,
        meta.glow,
        isActive && "ring-2 ring-[color:var(--color-primary-ring)] shadow-[var(--shadow-elevated)]",
      )}
      role={onAdjustPeriod ? "button" : undefined}
      tabIndex={onAdjustPeriod ? 0 : undefined}
      onClick={onAdjustPeriod ? () => onAdjustPeriod(period) : undefined}
      onKeyDown={
        onAdjustPeriod
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onAdjustPeriod(period);
              }
            }
          : undefined
      }
    >
      {/* Status dot */}
      <div className="absolute -top-2 left-4 flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-2 py-0.5">
        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          {meta.label}
        </span>
      </div>

      <div className="mt-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            Period {period.index}
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-[color:var(--color-fg)]">
            {period.label}
          </div>
          <div className="mt-0.5 text-[11px] text-[color:var(--color-fg-muted)]">
            D{period.start_day} → D{period.end_day}
          </div>
        </div>
        {period.version_count > 1 ? (
          <Badge tone="neutral" size="sm" className="shrink-0">
            <GitBranch className="h-3 w-3" /> v{period.current_version}
          </Badge>
        ) : null}
      </div>

      {/* Goal */}
      {period.goal ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
          {period.goal}
        </p>
      ) : null}

      {/* Stats */}
      <div className="mt-3 flex items-center gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1 text-[color:var(--color-fg-muted)]">
          <Sparkles className="h-3 w-3" /> {period.tasks_total} task{period.tasks_total === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1 text-[color:var(--color-fg-muted)]">
          <CheckCircle2 className="h-3 w-3" /> {period.tasks_done} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, delay: 0.4 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "h-full rounded-full",
            period.status === "approved" ? "bg-[color:var(--color-success)]" : "ai-gradient",
          )}
        />
      </div>

      {/* CTA */}
      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[10px] text-[color:var(--color-fg-subtle)]">
          {period.ai_confidence ? (
            <>
              <Sparkles className="h-3 w-3" /> {Math.round(period.ai_confidence)}% confidence
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" /> {progress}% complete
            </>
          )}
        </span>
        {period.plan_id == null ? null : (
          <Link
            href={`/mentor/plan-generator/${period.plan_id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--color-primary)] opacity-80 transition hover:opacity-100"
          >
            Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );

  return <div className="relative block focus-visible:outline-none">{content}</div>;
}

function AddPeriodCard({
  onClick,
  reduce,
  index,
}: {
  onClick?: () => void;
  reduce: boolean;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -3 }}
      className={cn(
        "group relative flex min-w-[220px] flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[color:var(--color-border-strong)] bg-white/60 px-4 py-6 text-center transition-all",
        "hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/40",
      )}
      disabled={!onClick}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full ai-gradient text-white shadow-[var(--shadow-ai)] transition-transform group-hover:scale-105">
        <Plus className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-[color:var(--color-fg)]">Add a new period</span>
      <span className="text-[11px] text-[color:var(--color-fg-muted)]">
        Generate the next chapter of the journey
      </span>
    </motion.button>
  );
}
