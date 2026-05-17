"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toApiError } from "@/lib/api";
import { humanizeSignalType, inferSignalTone } from "@/lib/constants";
import { fmtDate } from "@/lib/format";
import {
  applyAdjustment,
  approveAdjustment,
  generateAdjustmentForPeriod,
  generateAdjustmentFromSignal,
  updateAdjustmentChanges,
} from "@/services/plan-adjustments";
import { listSignalsForNewcomer } from "@/services/signals";
import { ChangeCard } from "@/components/mentor/plan-generator/ChangeCard";
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
  /** When set, the sheet auto-generates a draft seeded from this signal instead of from period signals. */
  seedSignalId?: ID | null;
  /** Optional context to display in the header rail. */
  seedSignalContext?: AISignal | null;
  /** When provided, mentor can defer add_task / replace_task changes to this next period's plan_id. */
  nextPeriodPlanId?: ID | null;
  /** Optional label for the next period — surfaced in the defer tooltip. */
  nextPeriodLabel?: string | null;
}

type CurationEntry = {
  accepted: boolean;
  editing: boolean;
  overrides: Partial<PlanAdjustmentSuggestedChange>;
  deferredToPlanId?: ID;
};

export function PeriodAdjustmentSheet(props: PeriodAdjustmentSheetProps) {
  if (!props.open || !props.period) return null;
  return <PeriodAdjustmentSheetInner {...props} period={props.period} />;
}

interface PeriodAdjustmentSheetInnerProps extends Omit<PeriodAdjustmentSheetProps, "period"> {
  period: JourneyPeriod;
}

function PeriodAdjustmentSheetInner({
  onClose,
  newcomerId,
  newcomerName,
  period,
  seedSignalId,
  seedSignalContext,
  nextPeriodPlanId,
  nextPeriodLabel,
}: PeriodAdjustmentSheetInnerProps) {
  const qc = useQueryClient();
  const [draft, setDraft] = React.useState<PlanAdjustment | null>(null);
  const [curation, setCuration] = React.useState<Record<string, CurationEntry>>({});
  const planId = period.plan_id;

  const signalsQ = useQuery({
    queryKey: ["signals", "period-adjustment", newcomerId],
    queryFn: () => listSignalsForNewcomer(newcomerId!, "open"),
    enabled: newcomerId != null,
  });

  const generateMut = useMutation({
    mutationFn: async (): Promise<PlanAdjustment> => {
      if (seedSignalId != null) {
        return generateAdjustmentFromSignal(seedSignalId);
      }
      if (!planId) throw new Error("No generated period to adjust");
      return generateAdjustmentForPeriod(planId);
    },
    onSuccess: (resp) => {
      const seeded = seedChangeIds(resp);
      setDraft(seeded);
      setCuration(initCuration(seeded.suggested_changes ?? []));
      toast.success("Adjustment draft ready", {
        description: `${seeded.suggested_changes?.length ?? 0} proposed change${(seeded.suggested_changes?.length ?? 0) === 1 ? "" : "s"}.`,
      });
      qc.invalidateQueries({ queryKey: ["plan-adjustments"] });
    },
    onError: (err) => toast.error("Draft unavailable", { description: toApiError(err).message }),
  });

  // Auto-generate once on mount when seeded by a signal — bypass the manual CTA.
  // Component remounts on each open thanks to the outer guard, so a mount-time effect is correct.
  const generateMutate = generateMut.mutate;
  React.useEffect(() => {
    if (seedSignalId == null) return;
    generateMutate();
  }, [seedSignalId, generateMutate]);

  const applyMut = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("No draft to apply");
      const curated = buildCuratedChanges(draft.suggested_changes ?? [], curation);
      if (curated.length === 0) {
        throw new Error("Pick at least one change to apply");
      }
      // PATCH the draft with the curated/edited subset so apply only ever runs the kept changes.
      await updateAdjustmentChanges(draft.id, curated);
      if (draft.status === "pending") {
        await approveAdjustment(draft.id);
      }
      return applyAdjustment(draft.id);
    },
    onSuccess: async () => {
      const counts = summarizeCuration(curation);
      toast.success("Period adjusted", {
        description: `${counts.accepted} change${counts.accepted === 1 ? "" : "s"} applied${
          counts.deferred ? ` · ${counts.deferred} deferred` : ""
        }.`,
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["journey", newcomerId] }),
        qc.invalidateQueries({ queryKey: ["plan", planId] }),
        qc.invalidateQueries({ queryKey: ["onboarding-plans", newcomerId] }),
        qc.invalidateQueries({ queryKey: ["signals", newcomerId] }),
      ]);
      onClose();
    },
    onError: (err) => toast.error("Could not apply draft", { description: toApiError(err).message }),
  });

  const changes = draft?.suggested_changes ?? [];
  const signals = signalsQ.data ?? [];
  const counts = summarizeCuration(curation);
  const railSignals = seedSignalContext ? [seedSignalContext, ...signals.filter((s) => s.id !== seedSignalContext.id)] : signals;
  const seedingFromSignal = seedSignalId != null;

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
                  {seedingFromSignal ? "Signal-seeded adjustment" : "Signal-aware adjustment"}
                </div>
                <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[color:var(--color-fg)]">
                  Adjust {period.label}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-[color:var(--color-fg-muted)]">
                  {seedingFromSignal && seedSignalContext
                    ? `Steered by "${seedSignalContext.title}". `
                    : ""}
                  {newcomerName ? `${newcomerName} — d` : "D"}one tasks stay untouched; only unfinished work changes.
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
            <Metric
              label="Window"
              value={
                period.start_date && period.end_date
                  ? `${fmtDate(period.start_date)} - ${fmtDate(period.end_date)}`
                  : `D${period.start_day} - D${period.end_day}`
              }
            />
            <Metric label="Progress" value={`${period.tasks_done}/${period.tasks_total} done`} />
            <Metric
              label="Signals"
              value={signalsQ.isLoading ? "Loading" : `${signals.length} open`}
            />
            <Metric
              label="Draft"
              value={
                draft
                  ? `${counts.accepted}/${changes.length} selected`
                  : seedingFromSignal && generateMut.isPending
                    ? "Generating"
                    : "Not generated"
              }
            />
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[340px_1fr]">
          <aside className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                {seedingFromSignal ? "Steering signal" : "Signals considered"}
              </div>
              <Badge tone="neutral" size="sm">
                {railSignals.length}
              </Badge>
            </div>
            <div className="mt-3 space-y-2">
              {signalsQ.isLoading && railSignals.length === 0 ? (
                <SignalSkeleton />
              ) : railSignals.length ? (
                railSignals.map((signal) => (
                  <SignalChip
                    key={signal.id}
                    signal={signal}
                    highlighted={seedSignalContext?.id === signal.id}
                  />
                ))
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
                    {generateMut.isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Sparkles className="h-6 w-6" />
                    )}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[color:var(--color-fg)]">
                    {seedingFromSignal
                      ? "Drafting changes from the signal…"
                      : "Generate an adjustment draft"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                    {seedingFromSignal
                      ? "The AI is proposing targeted changes — add, modify, rewrite, remove, or carry tasks forward."
                      : "The draft can add tasks, modify unfinished tasks, remove redundant tasks, add a follow-up period, or rebalance the remaining period."}
                  </p>
                  {!seedingFromSignal ? (
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
                  ) : null}
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
                      <h3 className="mt-0.5 text-base font-semibold text-[color:var(--color-fg)]">
                        {draft.title}
                      </h3>
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
                  {changes.map((change, idx) => {
                    const key = changeKey(change, idx);
                    const entry = curation[key] ?? defaultEntry();
                    return (
                      <ChangeCard
                        key={key}
                        change={change}
                        index={idx}
                        accepted={entry.accepted}
                        editing={entry.editing}
                        overrides={entry.overrides}
                        deferredToPlanId={entry.deferredToPlanId}
                        nextPeriodLabel={nextPeriodLabel}
                        nextPeriodPlanId={nextPeriodPlanId}
                        onToggleAccept={(accepted) =>
                          setCuration((c) => ({
                            ...c,
                            [key]: { ...defaultEntry(), ...c[key], accepted },
                          }))
                        }
                        onToggleEdit={(editing) =>
                          setCuration((c) => ({
                            ...c,
                            [key]: { ...defaultEntry(), ...c[key], editing },
                          }))
                        }
                        onChangeOverrides={(overrides) =>
                          setCuration((c) => ({
                            ...c,
                            [key]: { ...defaultEntry(), ...c[key], overrides },
                          }))
                        }
                        onDefer={(planId) =>
                          setCuration((c) => ({
                            ...c,
                            [key]: { ...defaultEntry(), ...c[key], deferredToPlanId: planId as ID },
                          }))
                        }
                        onUndefer={() =>
                          setCuration((c) => ({
                            ...c,
                            [key]: { ...defaultEntry(), ...c[key], deferredToPlanId: undefined },
                          }))
                        }
                        onReset={() =>
                          setCuration((c) => ({
                            ...c,
                            [key]: defaultEntry(),
                          }))
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>

        <footer className="border-t border-[color:var(--color-border)] bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs text-[color:var(--color-fg-muted)]">
                Applies only to unfinished tasks. Done work stays as evidence of progress.
              </p>
              {draft ? (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[color:var(--color-fg-subtle)]">
                  <Badge tone="neutral" size="sm">
                    {counts.accepted} selected
                  </Badge>
                  {counts.edited > 0 ? (
                    <Badge tone="ai" size="sm">
                      {counts.edited} edited
                    </Badge>
                  ) : null}
                  {counts.deferred > 0 ? (
                    <Badge tone="warning" size="sm">
                      {counts.deferred} deferred
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              {draft ? (
                <Button
                  variant="ai"
                  disabled={applyMut.isPending || draft.status === "applied" || counts.accepted === 0}
                  onClick={() => applyMut.mutate()}
                  className="shadow-[var(--shadow-ai)]"
                >
                  {applyMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {applyMut.isPending
                    ? "Applying..."
                    : counts.accepted === 0
                      ? "Pick at least one"
                      : `Apply ${counts.accepted} change${counts.accepted === 1 ? "" : "s"}`}
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

function SignalChip({ signal, highlighted }: { signal: AISignal; highlighted?: boolean }) {
  const tone = inferSignalTone(signal);
  return (
    <div
      className={
        highlighted
          ? "rounded-lg border-2 border-[color:var(--color-primary-ring)] bg-white p-3 shadow-[var(--shadow-ai)]"
          : "rounded-lg border border-[color:var(--color-border)] bg-white p-3"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <Badge
          tone={tone === "critical" ? "danger" : tone === "positive" ? "success" : "warning"}
          size="sm"
        >
          {humanizeSignalType(signal.signal_type)}
        </Badge>
        <span className="text-[10px] font-semibold uppercase text-[color:var(--color-fg-subtle)]">
          {signal.severity}
        </span>
      </div>
      <div className="mt-2 text-sm font-medium leading-snug text-[color:var(--color-fg)]">{signal.title}</div>
      {signal.suggested_action ? (
        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
          {signal.suggested_action}
        </p>
      ) : null}
    </div>
  );
}

function SignalSkeleton() {
  return (
    <>
      {[0, 1, 2].map((idx) => (
        <div
          key={idx}
          className="h-24 animate-pulse rounded-lg border border-[color:var(--color-border)] bg-white"
        />
      ))}
    </>
  );
}

function changeKey(change: PlanAdjustmentSuggestedChange, idx: number): string {
  return change.id || `${change.action}-${change.task_id ?? "x"}-${idx}`;
}

function seedChangeIds(draft: PlanAdjustment): PlanAdjustment {
  if (!draft.suggested_changes) return draft;
  return {
    ...draft,
    suggested_changes: draft.suggested_changes.map((c, idx) => ({
      ...c,
      id: c.id || `${c.action}-${c.task_id ?? "x"}-${idx}-${Math.random().toString(36).slice(2, 8)}`,
    })),
  };
}

function initCuration(changes: PlanAdjustmentSuggestedChange[]): Record<string, CurationEntry> {
  const out: Record<string, CurationEntry> = {};
  changes.forEach((c, idx) => {
    out[changeKey(c, idx)] = defaultEntry();
  });
  return out;
}

function defaultEntry(): CurationEntry {
  return { accepted: true, editing: false, overrides: {} };
}

function buildCuratedChanges(
  changes: PlanAdjustmentSuggestedChange[],
  curation: Record<string, CurationEntry>,
): PlanAdjustmentSuggestedChange[] {
  return changes
    .map((c, idx) => {
      const entry = curation[changeKey(c, idx)] ?? defaultEntry();
      if (!entry.accepted) return null;
      const merged: PlanAdjustmentSuggestedChange = { ...c, ...entry.overrides };
      if (entry.deferredToPlanId != null) {
        // Defer = rewrite as an add_task pointed at the next period's plan.
        // Drop the original task_id so backend doesn't try to mutate a task on the wrong plan.
        merged.action = "add_task";
        merged.target_plan_id = entry.deferredToPlanId;
        merged.task_id = null;
      }
      return merged;
    })
    .filter((c): c is PlanAdjustmentSuggestedChange => c !== null);
}

function summarizeCuration(curation: Record<string, CurationEntry>): {
  accepted: number;
  edited: number;
  deferred: number;
} {
  let accepted = 0;
  let edited = 0;
  let deferred = 0;
  for (const entry of Object.values(curation)) {
    if (entry.accepted) accepted += 1;
    if (Object.keys(entry.overrides).length > 0) edited += 1;
    if (entry.deferredToPlanId != null) deferred += 1;
  }
  return { accepted, edited, deferred };
}
