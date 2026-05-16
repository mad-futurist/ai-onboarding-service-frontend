"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  FileDiff,
  GitBranchPlus,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toApiError } from "@/lib/api";
import { humanizeSignalType, inferSignalTone } from "@/lib/constants";
import { fmtDate } from "@/lib/format";
import {
  applyAdjustment,
  approveAdjustment,
  generateAdjustmentForPeriod,
} from "@/services/plan-adjustments";
import { listSignalsForNewcomer } from "@/services/signals";
import type {
  AISignal,
  ID,
  JourneyPeriod,
  PlanAdjustment,
  PlanAdjustmentSuggestedChange,
} from "@/types";

interface PeriodAdjustmentSheetProps {
  open: boolean;
  onClose: () => void;
  newcomerId: ID | null;
  newcomerName?: string;
  period: JourneyPeriod | null;
}

const ACTION_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  add_task: { label: "Add task", icon: Plus, tone: "text-emerald-700 bg-emerald-500/10" },
  add: { label: "Add task", icon: Plus, tone: "text-emerald-700 bg-emerald-500/10" },
  update_task_field: { label: "Modify task", icon: Pencil, tone: "text-sky-700 bg-sky-500/10" },
  replace_task: { label: "Rewrite task", icon: FileDiff, tone: "text-violet-700 bg-violet-500/10" },
  delete_task: { label: "Remove task", icon: Trash2, tone: "text-rose-700 bg-rose-500/10" },
  add_period: { label: "Add period", icon: GitBranchPlus, tone: "text-orange-700 bg-orange-500/10" },
  adjust_remaining_period: { label: "Adjust remaining", icon: Wand2, tone: "text-amber-700 bg-amber-500/10" },
};

export function PeriodAdjustmentSheet({
  open,
  onClose,
  newcomerId,
  newcomerName,
  period,
}: PeriodAdjustmentSheetProps) {
  const qc = useQueryClient();
  const [draft, setDraft] = React.useState<PlanAdjustment | null>(null);
  const planId = period?.plan_id ?? null;

  React.useEffect(() => {
    if (!open) setDraft(null);
  }, [open]);

  const signalsQ = useQuery({
    queryKey: ["signals", "period-adjustment", newcomerId],
    queryFn: () => listSignalsForNewcomer(newcomerId!, "open"),
    enabled: open && newcomerId != null,
  });

  const generateMut = useMutation({
    mutationFn: () => {
      if (!planId) throw new Error("No generated period to adjust");
      return generateAdjustmentForPeriod(planId);
    },
    onSuccess: (resp) => {
      setDraft(resp);
      toast.success("Adjustment draft ready", {
        description: `${resp.suggested_changes?.length ?? 0} proposed change${(resp.suggested_changes?.length ?? 0) === 1 ? "" : "s"}.`,
      });
      qc.invalidateQueries({ queryKey: ["plan-adjustments"] });
    },
    onError: (err) => toast.error("Draft unavailable", { description: toApiError(err).message }),
  });

  const applyMut = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("No draft to apply");
      if (draft.status === "pending") {
        await approveAdjustment(draft.id);
      }
      return applyAdjustment(draft.id);
    },
    onSuccess: async () => {
      toast.success("Period adjusted", {
        description: "The draft changes were applied to unfinished tasks.",
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["journey", newcomerId] }),
        qc.invalidateQueries({ queryKey: ["plan", planId] }),
        qc.invalidateQueries({ queryKey: ["onboarding-plans", newcomerId] }),
      ]);
      onClose();
    },
    onError: (err) => toast.error("Could not apply draft", { description: toApiError(err).message }),
  });

  if (!open || !period) return null;

  const changes = draft?.suggested_changes ?? [];
  const signals = signalsQ.data ?? [];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-stone-950/45 backdrop-blur-[3px]" onClick={onClose} />
      <section className="absolute inset-x-0 bottom-0 top-5 mx-auto flex max-w-6xl flex-col overflow-hidden rounded-t-[24px] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-elevated)] sm:inset-y-5 sm:rounded-[24px]">
        <header className="relative border-b border-[color:var(--color-border)] bg-gradient-to-b from-white to-[color:var(--color-bg)] px-5 py-4 sm:px-6">
          <div className="absolute inset-x-0 top-0 h-[2px] ai-gradient" />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl ai-gradient text-white shadow-[var(--shadow-ai)]">
                <Wand2 className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
                  Signal-aware adjustment
                </div>
                <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[color:var(--color-fg)]">
                  Adjust {period.label}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-[color:var(--color-fg-muted)]">
                  Draft changes from all open signals for {newcomerName ?? "this newcomer"}. Done tasks stay untouched.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {planId ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/mentor/plan-generator/${planId}`}>
                    Open period <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-[color:var(--color-fg-muted)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <Metric label="Window" value={period.start_date && period.end_date ? `${fmtDate(period.start_date)} - ${fmtDate(period.end_date)}` : `D${period.start_day} - D${period.end_day}`} />
            <Metric label="Progress" value={`${period.tasks_done}/${period.tasks_total} done`} />
            <Metric label="Signals" value={signalsQ.isLoading ? "Loading" : `${signals.length} open`} />
            <Metric label="Draft" value={draft ? `${changes.length} changes` : "Not generated"} />
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[340px_1fr]">
          <aside className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                Signals considered
              </div>
              <Badge tone="neutral" size="sm">{signals.length}</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {signalsQ.isLoading ? (
                <SignalSkeleton />
              ) : signals.length ? (
                signals.map((signal) => <SignalChip key={signal.id} signal={signal} />)
              ) : (
                <div className="rounded-lg border border-[color:var(--color-border)] bg-white p-3 text-sm text-[color:var(--color-fg-muted)]">
                  No open signal yet. Run signal detection from the Signals screen, then come back here.
                </div>
              )}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-5 sm:p-6">
            {!draft ? (
              <div className="grid min-h-[420px] place-items-center">
                <div className="max-w-xl text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl ai-gradient text-white shadow-[var(--shadow-ai)]">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[color:var(--color-fg)]">
                    Generate an adjustment draft
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                    The draft can add tasks, modify unfinished tasks, remove redundant tasks, add a follow-up period, or rebalance the remaining period.
                  </p>
                  <Button
                    variant="ai"
                    size="lg"
                    className="mt-5 shadow-[var(--shadow-ai)]"
                    disabled={!planId || !signals.length || generateMut.isPending || signalsQ.isLoading}
                    onClick={() => generateMut.mutate()}
                  >
                    {generateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {generateMut.isPending ? "Generating draft..." : "Generate from signals"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
                        Draft proposal
                      </div>
                      <h3 className="mt-0.5 text-base font-semibold text-[color:var(--color-fg)]">{draft.title}</h3>
                    </div>
                    <Badge tone={draft.status === "applied" ? "success" : "ai"} size="lg">
                      {draft.status}
                    </Badge>
                  </div>
                  {draft.reason ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                      {draft.reason}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3">
                  {changes.map((change, idx) => (
                    <ChangeCard key={`${change.action}-${change.task_id ?? idx}-${idx}`} change={change} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>

        <footer className="border-t border-[color:var(--color-border)] bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[color:var(--color-fg-muted)]">
              Applies only to unfinished tasks. Done work stays as evidence of progress.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              {draft ? (
                <Button
                  variant="ai"
                  disabled={applyMut.isPending || draft.status === "applied"}
                  onClick={() => applyMut.mutate()}
                  className="shadow-[var(--shadow-ai)]"
                >
                  {applyMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {applyMut.isPending ? "Applying..." : "Apply draft"}
                </Button>
              ) : null}
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">{label}</div>
      <div className="mt-0.5 truncate text-sm font-semibold text-[color:var(--color-fg)]">{value}</div>
    </div>
  );
}

function SignalChip({ signal }: { signal: AISignal }) {
  const tone = inferSignalTone(signal);
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <Badge tone={tone === "critical" ? "danger" : tone === "positive" ? "success" : "warning"} size="sm">
          {humanizeSignalType(signal.signal_type)}
        </Badge>
        <span className="text-[10px] font-semibold uppercase text-[color:var(--color-fg-subtle)]">{signal.severity}</span>
      </div>
      <div className="mt-2 text-sm font-medium leading-snug text-[color:var(--color-fg)]">{signal.title}</div>
      {signal.suggested_action ? (
        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">{signal.suggested_action}</p>
      ) : null}
    </div>
  );
}

function SignalSkeleton() {
  return (
    <>
      {[0, 1, 2].map((idx) => (
        <div key={idx} className="h-24 animate-pulse rounded-lg border border-[color:var(--color-border)] bg-white" />
      ))}
    </>
  );
}

function ChangeCard({ change, index }: { change: PlanAdjustmentSuggestedChange; index: number }) {
  const meta = ACTION_META[change.action] ?? ACTION_META.update_task_field;
  const Icon = meta.icon;
  return (
    <article className="rounded-xl border border-[color:var(--color-border)] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.tone)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              Change {index + 1}
            </span>
            <Badge tone="neutral" size="sm">{meta.label}</Badge>
            {change.task_id ? <Badge tone="ai" size="sm">task #{change.task_id}</Badge> : null}
          </div>
          <h4 className="mt-1 text-sm font-semibold text-[color:var(--color-fg)]">
            {change.title || meta.label}
          </h4>
          {change.description ? (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              {change.description}
            </p>
          ) : null}
          {change.reason ? (
            <div className="mt-3 rounded-lg bg-[color:var(--color-surface-muted)] px-3 py-2 text-xs text-[color:var(--color-fg-muted)]">
              {change.reason}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
