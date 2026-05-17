"use client";

import * as React from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Loader2, Sparkles, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AISignal, JourneyPeriod } from "@/types";

interface AdjustPeriodPickerStepProps {
  periods: JourneyPeriod[];
  isLoading: boolean;
  signal: AISignal | null;
  selectedPeriodId: number | null;
  onSelect: (period: JourneyPeriod) => void;
  onConfirm: () => void;
  onCancel: () => void;
  signalCountByPlanId?: Record<number, number>;
}

export function AdjustPeriodPickerStep({
  periods,
  isLoading,
  signal,
  selectedPeriodId,
  onSelect,
  onConfirm,
  onCancel,
  signalCountByPlanId,
}: AdjustPeriodPickerStepProps) {
  const recommendedPlanId = pickRecommendedPlanId(periods, signal);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
          <Sparkles className="h-3.5 w-3.5" /> Pick a period to adjust
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
          The AI will draft per-task changes for the period you pick — using the signal as steering
          context. Done tasks stay untouched.
        </p>
        {signal ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs">
            <Badge tone="ai" size="sm">
              {signal.signal_type}
            </Badge>
            <span className="font-medium text-[color:var(--color-fg)]">{signal.title}</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : periods.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white p-6 text-center text-sm text-[color:var(--color-fg-muted)]">
            No periods found for this newcomer. Generate a plan first, then try again.
          </div>
        ) : (
          periods.map((period) => {
            const active = selectedPeriodId === period.id;
            const recommended = recommendedPlanId != null && period.plan_id === recommendedPlanId;
            const openSignals = signalCountByPlanId?.[Number(period.plan_id)] ?? 0;
            const progressPct =
              period.tasks_total > 0
                ? Math.round((period.tasks_done / period.tasks_total) * 100)
                : 0;

            return (
              <button
                key={period.id}
                type="button"
                onClick={() => onSelect(period)}
                className={cn(
                  "group relative w-full rounded-xl border bg-white p-4 text-left transition-all",
                  active
                    ? "border-[color:var(--color-primary-ring)] ring-2 ring-[color:var(--color-primary-ring)] shadow-[var(--shadow-ai)]"
                    : "border-[color:var(--color-border)] hover:-translate-y-0.5 hover:border-[color:var(--color-primary-ring)]",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral" size="sm">
                        Period {period.index}
                      </Badge>
                      {recommended ? (
                        <Badge tone="ai" size="sm" className="inline-flex items-center gap-1">
                          <Target className="h-3 w-3" /> Recommended
                        </Badge>
                      ) : null}
                      {active ? (
                        <Badge tone="success" size="sm" className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Selected
                        </Badge>
                      ) : null}
                    </div>
                    <h4 className="mt-1 truncate text-sm font-semibold text-[color:var(--color-fg)]">
                      {period.label}
                    </h4>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)]">
                      <CalendarDays className="h-3 w-3" />
                      {period.start_date && period.end_date
                        ? `${fmtDate(period.start_date)} – ${fmtDate(period.end_date)}`
                        : `Day ${period.start_day} – ${period.end_day}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                      Progress
                    </div>
                    <div className="text-sm font-semibold text-[color:var(--color-fg)]">
                      {period.tasks_done}/{period.tasks_total}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--color-primary)] transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  {openSignals > 0 ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                      {openSignals} open signal{openSignals === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="ai"
          disabled={selectedPeriodId == null || isLoading}
          onClick={onConfirm}
          data-demo-id="adjust-period-confirm"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Generate proposal <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function pickRecommendedPlanId(
  periods: JourneyPeriod[],
  signal: AISignal | null,
): number | null {
  if (!signal) return null;
  // Best signal we have: target_task_id implies the period whose plan contains the task.
  // Since the journey periods map 1:1 to plans, we can't fully resolve the task→plan here
  // without an extra fetch — but we recommend the first non-archived period as a sensible default.
  // The orchestrator can refine this later if it knows the task→plan mapping.
  const activePeriod = periods.find(
    (p) => p.status !== "archived" && p.tasks_done < p.tasks_total,
  );
  return activePeriod ? Number(activePeriod.plan_id) : null;
}
