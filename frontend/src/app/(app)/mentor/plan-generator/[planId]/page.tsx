"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RefreshCcw,
  Check,
  Target,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { PlanBreadcrumb } from "@/components/mentor/plan-generator/PlanBreadcrumb";
import { WorkspaceTabs } from "@/components/mentor/plan-generator/WorkspaceTabs";

import { approvePlan, getPlan, regeneratePlan } from "@/services/plans";
import { getNewcomer } from "@/services/newcomers";
import { toApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { ID, OnboardingPlanWithTasks } from "@/types";

export default function PlanWorkspacePage() {
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

  const [selectedDocs, setSelectedDocs] = React.useState<Set<ID>>(new Set());
  const [overviewOpen, setOverviewOpen] = React.useState(true);
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
      setRegenNotes("");
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
        <PlanBreadcrumb
          crumbs={[
            { label: "Plan generator", href: "/mentor/plan-generator" },
            { label: "Loading…" },
          ]}
        />
        <Skeleton className="h-96" />
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
      />

      {/* Compact header card: who + AI avis */}
      <section className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <AIInsightCard
          title={
            <>
              AI&apos;s take on this plan
              <span className="ml-2 text-xs font-normal text-[color:var(--color-fg-muted)]">
                {plan.title}
              </span>
            </>
          }
          description={firstParagraph(plan.description)}
          confidence={plan.ai_confidence ?? 82}
          tone="soft"
          actions={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOverviewOpen((v) => !v)}
            >
              {overviewOpen ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Details
                </>
              )}
            </Button>
          }
        >
          {overviewOpen ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <PhaseMeta label="First 30 days" value={tasksByPhase.phase1} hint="Orientation & first PR" />
                <PhaseMeta label="Days 31–60" value={tasksByPhase.phase2} hint="Own a small feature" />
                <PhaseMeta label="Days 61–90" value={tasksByPhase.phase3} hint="Independent work" />
              </div>
              {plan.missing_context?.length ? (
                <div className="rounded-lg border border-[color:var(--color-warning-soft)] bg-white p-3">
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
                <details className="rounded-lg bg-white/60 px-3 py-2">
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
              <details className="rounded-lg bg-white/60 px-3 py-2">
                <summary className="cursor-pointer text-xs font-medium text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]">
                  Regenerate the whole plan with steering notes
                </summary>
                <div className="mt-2 space-y-2">
                  <Textarea
                    rows={3}
                    placeholder="e.g. shift more focus to deployment in the first two weeks."
                    value={regenNotes}
                    onChange={(e) => setRegenNotes(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ai"
                      disabled={regenMut.isPending}
                      onClick={() => regenMut.mutate()}
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      {regenMut.isPending ? "Regenerating…" : "Regenerate plan"}
                    </Button>
                  </div>
                </div>
              </details>
            </div>
          ) : null}
        </AIInsightCard>

        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              <Target className="h-3 w-3 text-[color:var(--color-primary)]" /> Who this plan is for
            </div>
            {newcomer ? (
              <>
                <Row icon={<User className="h-3 w-3" />} label="Name" value={newcomer.full_name ?? "—"} />
                <Row label="Role" value={newcomer.job_title} />
                <Row label="Seniority" value={newcomer.seniority} />
                <Row label="Team" value={newcomer.team} />
                <Row label="Start" value={fmtDate(newcomer.start_date)} />
                {newcomer.main_goal ? (
                  <Row label="Goal" value={newcomer.main_goal} />
                ) : null}
              </>
            ) : (
              <Skeleton className="h-24" />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Workspace tabs — the main thing */}
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
    </>
  );
}

function Row({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-[color:var(--color-fg-subtle)]">
        {icon}
        {label}
      </dt>
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
