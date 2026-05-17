"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  GitBranch,
  GitCompare,
  ListChecks,
  Plus,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { WorkspaceTabs } from "@/components/mentor/plan-generator/WorkspaceTabs";
import { PeriodSwitcher } from "@/components/mentor/plan-generator/PeriodSwitcher";
import { RegenerateScopeDialog } from "@/components/mentor/plan-generator/RegenerateScopeDialog";
import { VersionDiffViewer } from "@/components/mentor/plan-generator/VersionDiffViewer";

import { approvePlan, getPlan, listWeeks, regeneratePlan } from "@/services/plans";
import { getNewcomer } from "@/services/newcomers";
import {
  getNewcomerJourney,
  listPeriodVersions,
  snapshotPeriodVersion,
} from "@/services/journey";
import { toApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type {
  ID,
  NewcomerJourney,
  OnboardingPlanWithTasks,
  PeriodVersion,
  PlanRegenerateRequest,
} from "@/types";

export default function PlanWorkspacePage() {
  const params = useParams<{ planId: string }>();
  const planId = Number(params.planId);
  const qc = useQueryClient();

  const planQ = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId),
    enabled: Number.isFinite(planId),
  });

  const newcomerQ = useQuery({
    queryKey: ["newcomer", planQ.data?.newcomer_id],
    queryFn: () => (planQ.data?.newcomer_id ? getNewcomer(planQ.data.newcomer_id) : null),
    enabled: !!planQ.data?.newcomer_id,
  });

  const journeyQ = useQuery<NewcomerJourney>({
    queryKey: ["journey", planQ.data?.newcomer_id],
    queryFn: () => getNewcomerJourney(planQ.data!.newcomer_id!),
    enabled: !!planQ.data?.newcomer_id,
  });

  const weeksQ = useQuery({
    queryKey: ["plan-weeks", planId],
    queryFn: () => listWeeks(planId),
    enabled: Number.isFinite(planId),
  });

  const [selectedDocs, setSelectedDocs] = React.useState<Set<ID>>(new Set());
  const [regenOpen, setRegenOpen] = React.useState(false);
  const [diffOpen, setDiffOpen] = React.useState(false);
  const [versions, setVersions] = React.useState<PeriodVersion[]>([]);

  // Load local versions (sessionStorage today, real backend tomorrow).
  React.useEffect(() => {
    if (!Number.isFinite(planId)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVersions(listPeriodVersions(planId));
  }, [planId]);

  const regenMut = useMutation({
    mutationFn: async (payload: PlanRegenerateRequest) => {
      // Snapshot current state into a new version before regenerating.
      if (payload.create_new_version && planQ.data) {
        snapshotPeriodVersion(planId, planQ.data, payload.mentor_notes ?? undefined);
      }
      return regeneratePlan(planId, payload);
    },
    onSuccess: (resp) => {
      toast.success(`Regenerated · ${resp.scope}`, {
        description: `${resp.affected_task_ids.length} task${resp.affected_task_ids.length === 1 ? "" : "s"} updated${resp.used_fallback ? " (fallback)" : ""}.`,
      });
      setRegenOpen(false);
      setVersions(listPeriodVersions(planId));
      qc.invalidateQueries({ queryKey: ["plan", planId] });
      qc.invalidateQueries({ queryKey: ["plan-weeks", planId] });
      qc.invalidateQueries({ queryKey: ["journey", planQ.data?.newcomer_id] });
    },
    onError: (err) =>
      toast.error("Regenerate failed", { description: toApiError(err).message }),
  });

  const approveMut = useMutation({
    mutationFn: () => approvePlan(planId),
    onSuccess: () => {
      toast.success("Period approved 🎉", {
        description: "It is now visible to the newcomer.",
      });
      qc.invalidateQueries({ queryKey: ["plan", planId] });
      qc.invalidateQueries({ queryKey: ["journey", planQ.data?.newcomer_id] });
    },
    onError: (err) => toast.error("Approve failed", { description: toApiError(err).message }),
  });

  if (planQ.isLoading || !planQ.data) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  const plan = planQ.data;
  const tasks = plan.tasks ?? [];
  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const grouped = groupByPhase(plan);
  const versionsCount = versions.length;

  return (
    <div
      className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6"
      data-demo-id="plan-workspace-page"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[color:var(--color-fg-muted)]">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/mentor/plan-generator">
            <ArrowLeft className="h-3.5 w-3.5" /> Journey
          </Link>
        </Button>
        <span>/</span>
        <span className="text-[color:var(--color-fg)]">{plan.title}</span>
      </div>

      {/* Period switcher (sticky) */}
      {journeyQ.data ? (
        <PeriodSwitcher
          journey={journeyQ.data}
          activePeriodId={plan.id}
        />
      ) : null}

      {/* Hero card: period header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[18px] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]"
        data-demo-id="plan-workspace-period-header"
      >
        <div className="absolute inset-0 ai-gradient-soft opacity-60" />
        <div className="absolute inset-x-0 top-0 h-[3px] ai-gradient" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={plan.mentor_approved ? "success" : "ai"} size="md">
                  {plan.mentor_approved ? (
                    <>
                      <Check className="h-3 w-3" /> Approved
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" /> Draft v{Math.max(1, versionsCount + 1)}
                    </>
                  )}
                </Badge>
                {plan.ai_confidence ? (
                  <Badge tone="neutral" size="sm">
                    {Math.round(plan.ai_confidence)}% confidence
                  </Badge>
                ) : null}
                {versionsCount > 0 ? (
                  <Badge tone="neutral" size="sm">
                    <GitBranch className="h-3 w-3" /> {versionsCount + 1} version{versionsCount + 1 === 1 ? "" : "s"}
                  </Badge>
                ) : null}
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-fg)]">
                {plan.title}
              </h1>
              {plan.period_start || plan.period_end ? (
                <p className="mt-0.5 text-sm text-[color:var(--color-fg-muted)]">
                  {fmtDate(plan.period_start)} → {fmtDate(plan.period_end)}
                </p>
              ) : null}
              {plan.goal ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-fg)]">
                  {plan.goal}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-fg-muted)]">
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="h-3 w-3" /> {tasks.length} task{tasks.length === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3" /> {tasksDone} done
                </span>
                <span className="inline-flex items-center gap-1">
                  <Target className="h-3 w-3" /> P1 {grouped.phase1} · P2 {grouped.phase2} · P3 {grouped.phase3}
                </span>
                {plan.missing_context?.length ? (
                  <span className="inline-flex items-center gap-1 text-[color:var(--color-warning-fg)]">
                    <AlertCircle className="h-3 w-3" /> {plan.missing_context.length} missing context
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setRegenOpen(true)}>
                <RefreshCcw className="h-3.5 w-3.5" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" disabled={versionsCount === 0} onClick={() => setDiffOpen(true)}>
                <GitCompare className="h-3.5 w-3.5" /> Compare versions
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/mentor/plan-generator/${plan.id}/week/new`}>
                  <Plus className="h-3.5 w-3.5" /> Add task
                </Link>
              </Button>
              {plan.mentor_approved ? (
                <Badge tone="success" size="lg" className="ml-1">
                  <Check className="h-3 w-3" /> Approved
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="ai"
                  disabled={approveMut.isPending}
                  onClick={() => approveMut.mutate()}
                  data-demo-id="plan-workspace-approve"
                >
                  <Check className="h-3.5 w-3.5" /> {approveMut.isPending ? "Approving…" : "Approve period"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI insight + newcomer card */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <AIInsightCard
          title={
            <>
              AI&apos;s take on this period
              <span className="ml-2 text-xs font-normal text-[color:var(--color-fg-muted)]">
                {plan.title}
              </span>
            </>
          }
          description={firstParagraph(plan.description)}
          confidence={plan.ai_confidence ?? null}
          tone="soft"
        >
          {plan.missing_context?.length ? (
            <div className="mt-3 rounded-lg border border-[color:var(--color-warning-soft)] bg-white p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-warning-fg)]">
                <AlertCircle className="h-3 w-3" /> Missing context
              </div>
              <ul className="mt-1 space-y-0.5 text-sm text-[color:var(--color-fg)]">
                {plan.missing_context.map((m) => (
                  <li key={m}>· {m}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {restParagraphs(plan.description).length ? (
            <details className="mt-3 rounded-lg bg-white/60 px-3 py-2">
              <summary className="cursor-pointer text-xs font-medium text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]">
                Show full AI rationale
              </summary>
              <div className="mt-2 space-y-2 text-sm text-[color:var(--color-fg)]">
                {restParagraphs(plan.description).map((p, i) => (
                  <p key={i} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </details>
          ) : null}
        </AIInsightCard>

        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              <Target className="h-3 w-3 text-[color:var(--color-primary)]" /> Who this is for
            </div>
            {newcomerQ.data ? (
              <>
                <Row label="Name" value={newcomerQ.data.full_name ?? "—"} />
                <Row label="Role" value={newcomerQ.data.job_title} />
                <Row label="Seniority" value={newcomerQ.data.seniority} />
                <Row label="Team" value={newcomerQ.data.team} />
                <Row label="Start" value={fmtDate(newcomerQ.data.start_date)} />
                {newcomerQ.data.main_goal ? (
                  <Row label="Main goal" value={newcomerQ.data.main_goal} />
                ) : null}
              </>
            ) : (
              <Skeleton className="h-24" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workspace tabs */}
      <WorkspaceTabs
        plan={plan}
        selectedDocs={selectedDocs}
        onToggleDoc={(id) =>
          setSelectedDocs((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onSelectAllDocs={(ids) => setSelectedDocs(new Set(ids))}
      />

      {/* Dialogs */}
      <RegenerateScopeDialog
        open={regenOpen}
        onOpenChange={setRegenOpen}
        weeks={weeksQ.data ?? []}
        pending={regenMut.isPending}
        onSubmit={(payload) => regenMut.mutate(payload)}
      />
      <VersionDiffViewer
        open={diffOpen}
        onOpenChange={setDiffOpen}
        versions={[...versions, currentAsVersion(plan, versionsCount)]}
      />
    </div>
  );
}

/* ---------- helpers ---------- */

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[color:var(--color-fg-subtle)]">{label}</dt>
      <dd className="max-w-[60%] truncate text-right font-medium text-[color:var(--color-fg)]">
        {value}
      </dd>
    </div>
  );
}

function groupByPhase(plan: OnboardingPlanWithTasks) {
  const all = plan.tasks ?? [];
  const dayOf = (t: (typeof all)[number]) => t.day_number ?? (t.week_number ?? 1) * 7;
  return {
    phase1: all.filter((t) => dayOf(t) <= 30).length,
    phase2: all.filter((t) => dayOf(t) > 30 && dayOf(t) <= 60).length,
    phase3: all.filter((t) => dayOf(t) > 60).length,
  };
}

function firstParagraph(description?: string | null) {
  if (!description) return "AI-generated plan for this period.";
  return description.split("\n\n")[0] || description;
}

function restParagraphs(description?: string | null): string[] {
  if (!description) return [];
  return description.split("\n\n").slice(1).filter(Boolean);
}

function currentAsVersion(
  plan: OnboardingPlanWithTasks,
  previousCount: number,
): PeriodVersion {
  const weeksMap = new Map<number, {
    id: ID | string;
    index: number;
    title: string;
    goals?: string[] | null;
    tasks: PeriodVersion["snapshot"]["weeks"][number]["tasks"];
  }>();
  for (const task of plan.tasks ?? []) {
    const weekIdx = task.week_number ?? 0;
    const bucket = weeksMap.get(weekIdx) ?? {
      id: task.week_id ?? `w${weekIdx}`,
      index: weekIdx,
      title: `Week ${weekIdx}`,
      goals: null,
      tasks: [],
    };
    bucket.tasks.push({
      id: task.id,
      title: task.title,
      description: task.description,
      success_criteria: task.success_criteria,
      priority: task.priority,
      status: task.status,
    });
    weeksMap.set(weekIdx, bucket);
  }
  return {
    id: -1,
    period_id: plan.id,
    version_number: previousCount + 1,
    created_at: plan.updated_at ?? plan.created_at,
    snapshot: {
      weeks: Array.from(weeksMap.values()).sort((a, b) => a.index - b.index),
    },
  };
}
