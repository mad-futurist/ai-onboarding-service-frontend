"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RefreshCcw,
  Check,
  ArrowRight,
  Target,
  GitBranch,
  AlertCircle,
  Edit3,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { PlanBreadcrumb } from "@/components/mentor/plan-generator/PlanBreadcrumb";

import { approvePlan, getPlan, regeneratePlan } from "@/services/plans";
import { getNewcomer } from "@/services/newcomers";
import { toApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { OnboardingPlanWithTasks } from "@/types";

export default function PlanOverviewPage() {
  const params = useParams<{ planId: string }>();
  const planId = Number(params.planId);
  const qc = useQueryClient();

  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId),
    enabled: Number.isFinite(planId),
  });

  const { data: newcomer } = useQuery({
    queryKey: ["newcomer", plan?.newcomer_id],
    queryFn: () => (plan?.newcomer_id ? getNewcomer(plan.newcomer_id) : null),
    enabled: !!plan?.newcomer_id,
  });

  const [regenNotes, setRegenNotes] = React.useState("");

  const regenMut = useMutation({
    mutationFn: () =>
      regeneratePlan(planId, {
        scope: "plan",
        preserve_manual_edits: true,
        mentor_notes: regenNotes || undefined,
      }),
    onSuccess: (resp) => {
      toast.success("Plan regenerated", {
        description: `${resp.affected_task_ids.length} tasks updated${resp.used_fallback ? " (fallback)" : ""}.`,
      });
      qc.invalidateQueries({ queryKey: ["plan", planId] });
      qc.invalidateQueries({ queryKey: ["plan-weeks", planId] });
    },
    onError: (err) =>
      toast.error("Regenerate failed", { description: toApiError(err).message }),
  });

  const approveMut = useMutation({
    mutationFn: () => approvePlan(planId),
    onSuccess: () => {
      toast.success("Plan approved");
      qc.invalidateQueries({ queryKey: ["plan", planId] });
    },
    onError: (err) => toast.error("Approve failed", { description: toApiError(err).message }),
  });

  if (isLoading || !plan) {
    return (
      <>
        <PlanBreadcrumb crumbs={[{ label: "Plan generator", href: "/mentor/plan-generator" }, { label: "Loading…" }]} />
        <Skeleton className="h-64" />
      </>
    );
  }

  const tasksByPhase = groupTasks(plan);

  return (
    <>
      <PlanBreadcrumb
        crumbs={[
          { label: "Plan generator", href: "/mentor/plan-generator" },
          { label: plan.title, href: `/mentor/plan-generator/${plan.id}` },
        ]}
        actions={
          <Button asChild variant="ai" size="sm">
            <Link href={`/mentor/plan-generator/${plan.id}/workspace`}>
              Open workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="space-y-5">
          <AIInsightCard
            title={
              <>
                Avis de l&apos;IA — <span className="font-normal text-sm text-[color:var(--color-fg-muted)]">{plan.title}</span>
              </>
            }
            description={firstParagraph(plan.description)}
            confidence={plan.ai_confidence ?? 82}
            tone="soft"
            actions={
              plan.mentor_approved ? (
                <Badge tone="success" size="lg">
                  <Check className="h-3 w-3" /> Approved
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="ai"
                  disabled={approveMut.isPending}
                  onClick={() => approveMut.mutate()}
                >
                  <Check className="h-3.5 w-3.5" />{" "}
                  {approveMut.isPending ? "Approving…" : "Approve plan"}
                </Button>
              )
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <PhaseMeta label="First 30 days" value={tasksByPhase.phase1} hint="Orientation & first PR" />
              <PhaseMeta label="Days 31–60" value={tasksByPhase.phase2} hint="Own a small feature" />
              <PhaseMeta label="Days 61–90" value={tasksByPhase.phase3} hint="Independent work" />
            </div>
            {plan.missing_context?.length ? (
              <div className="mt-4 rounded-lg border border-[color:var(--color-warning-soft)] bg-white p-3">
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
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]">
                  Show full AI rationale
                </summary>
                <div className="mt-2 space-y-2 text-sm text-[color:var(--color-fg)]">
                  {restParagraphs(plan.description).map((p, i) => (
                    <p key={i} className="leading-relaxed">{p}</p>
                  ))}
                </div>
              </details>
            ) : null}
          </AIInsightCard>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-[color:var(--color-primary)]" /> Regenerate the whole plan
              </CardTitle>
              <CardDescription>
                Add steering notes so the AI knows what to adjust. Manually-edited fields are preserved by default.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={3}
                placeholder="e.g. shift more focus to deployment in the first two weeks."
                value={regenNotes}
                onChange={(e) => setRegenNotes(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  variant="ai"
                  disabled={regenMut.isPending}
                  onClick={() => regenMut.mutate()}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {regenMut.isPending ? "Regenerating…" : "Regenerate plan"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[color:var(--color-primary)]" /> Workspace shortcuts
                  </CardTitle>
                  <CardDescription>Drill into the weeks, tasks, sources and adjustments.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/mentor/plan-generator/${plan.id}/workspace`}>
                    Open workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href={`/mentor/plan-generator/${plan.id}/workspace`}
                  className="rounded-lg border border-[color:var(--color-border)] p-3 text-sm hover:border-[color:var(--color-primary-ring)]"
                >
                  <div className="font-medium text-[color:var(--color-fg)]">Weeks & tasks</div>
                  <p className="text-xs text-[color:var(--color-fg-muted)]">
                    Reorder by drag-drop, edit each task, generate new ones with AI.
                  </p>
                </Link>
                <Link
                  href={`/mentor/plan-generator/${plan.id}/workspace`}
                  className="rounded-lg border border-[color:var(--color-border)] p-3 text-sm hover:border-[color:var(--color-primary-ring)]"
                >
                  <div className="font-medium text-[color:var(--color-fg)]">Sources & adjustments</div>
                  <p className="text-xs text-[color:var(--color-fg-muted)]">
                    Pick documents and review the AI&apos;s proposed plan adjustments.
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[color:var(--color-primary)]" /> Who this plan is for
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {newcomer ? (
                <>
                  <Row label="Name" value={newcomer.full_name ?? "—"} />
                  <Row label="Role" value={newcomer.job_title} />
                  <Row label="Seniority" value={newcomer.seniority} />
                  <Row label="Team" value={newcomer.team} />
                  <Row label="Start" value={fmtDate(newcomer.start_date)} />
                  {newcomer.main_goal ? <Row label="Goal" value={newcomer.main_goal} /> : null}
                </>
              ) : (
                <Skeleton className="h-32" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-[color:var(--color-primary)]" /> Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row
                label="Status"
                value={
                  <Badge tone={plan.mentor_approved ? "success" : "warning"} size="sm">
                    {plan.status}
                  </Badge>
                }
              />
              <Row label="Generated by AI" value={plan.generated_by_ai ? "Yes" : "No"} />
              <Row label="Tasks" value={String(plan.tasks?.length ?? 0)} />
              <Row label="Created" value={fmtDate(plan.created_at)} />
            </CardContent>
          </Card>

          {(plan.tasks ?? []).some((t) => (t.manually_edited_fields?.length ?? 0) > 0) ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--color-primary-active)]">
                  <Edit3 className="h-3.5 w-3.5" /> Manual edits preserved
                </div>
                <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                  Some tasks have been edited manually. Regenerations keep those fields untouched unless you opt-in.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[color:var(--color-fg-subtle)]">{label}</dt>
      <dd className="text-right max-w-[60%] truncate font-medium text-[color:var(--color-fg)]">
        {value}
      </dd>
    </div>
  );
}

function PhaseMeta({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-[color:var(--color-fg)]">{value}</div>
      <div className="text-xs text-[color:var(--color-fg-muted)]">{hint}</div>
    </div>
  );
}

function groupTasks(plan: OnboardingPlanWithTasks) {
  const all = plan.tasks ?? [];
  const dayOf = (t: (typeof all)[number]) =>
    t.day_number ?? (t.week_number ?? 1) * 7;
  return {
    phase1: all.filter((t) => dayOf(t) <= 30).length,
    phase2: all.filter((t) => dayOf(t) > 30 && dayOf(t) <= 60).length,
    phase3: all.filter((t) => dayOf(t) > 60).length,
  };
}

function firstParagraph(description?: string | null) {
  if (!description) return "AI-generated 30/60/90 plan.";
  return description.split("\n\n")[0] || description;
}

function restParagraphs(description?: string | null): string[] {
  if (!description) return [];
  const parts = description.split("\n\n");
  return parts.slice(1).filter(Boolean);
}
