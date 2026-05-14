"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  CalendarClock,
  MessageSquare,
  Activity,
  RefreshCcw,
  CheckCircle2,
  GitBranch,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { SkillMap } from "@/components/charts/SkillMap";
import { SignalRow } from "@/components/ai/SignalRow";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlanPhaseCard } from "@/components/mentor/PlanPhaseCard";
import { EmptyState } from "@/components/shared/EmptyState";

import { getMentorNewcomerDetail } from "@/services/dashboards";
import { getNewcomerPlan } from "@/services/newcomers";
import { detectSignals, ignoreSignal, resolveSignal } from "@/services/signals";
import { toApiError } from "@/lib/api";
import { getInitials } from "@/lib/utils";

export default function NewcomerProfilePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const qc = useQueryClient();

  const detail = useQuery({
    queryKey: ["mentor-newcomer-detail", id],
    queryFn: () => getMentorNewcomerDetail(id),
    enabled: Number.isFinite(id),
  });

  const plan = useQuery({
    queryKey: ["newcomer-plan", id],
    queryFn: () => getNewcomerPlan(id),
    enabled: Number.isFinite(id),
    retry: false,
  });

  const detectMut = useMutation({
    mutationFn: () => detectSignals(id),
    onSuccess: (resp) => {
      toast.success(
        resp.created_count
          ? `${resp.created_count} new signal${resp.created_count > 1 ? "s" : ""}`
          : "No new signals detected",
        { description: "AI scanned engagement, questions and task patterns." },
      );
      qc.invalidateQueries({ queryKey: ["mentor-newcomer-detail", id] });
      qc.invalidateQueries({ queryKey: ["mentor-dashboard"] });
    },
    onError: (err) => toast.error("Detection failed", { description: toApiError(err).message }),
  });

  const resolveMut = useMutation({
    mutationFn: (signalId: number) => resolveSignal(signalId),
    onSuccess: () => {
      toast.success("Signal resolved");
      qc.invalidateQueries({ queryKey: ["mentor-newcomer-detail", id] });
    },
    onError: (err) => toast.error("Couldn't resolve", { description: toApiError(err).message }),
  });
  const ignoreMut = useMutation({
    mutationFn: (signalId: number) => ignoreSignal(signalId),
    onSuccess: () => {
      toast.success("Signal ignored");
      qc.invalidateQueries({ queryKey: ["mentor-newcomer-detail", id] });
    },
    onError: (err) => toast.error("Couldn't ignore", { description: toApiError(err).message }),
  });

  if (detail.isLoading || !detail.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const data = detail.data;
  const newcomer = data.newcomer;
  const tasks = plan.data?.tasks ?? [];
  const phase1 = tasks.filter((t) => (t.day_number ?? (t.week_number ?? 1) * 7) <= 30);
  const phase2 = tasks.filter(
    (t) => (t.day_number ?? (t.week_number ?? 1) * 7) > 30 && (t.day_number ?? (t.week_number ?? 1) * 7) <= 60,
  );
  const phase3 = tasks.filter((t) => (t.day_number ?? (t.week_number ?? 1) * 7) > 60);

  const progressPct = newcomer.progress_percent ?? 0;
  const openSignals = data.signals?.filter((s) => s.status === "open") ?? [];
  const pendingAdjustment = data.adjustments?.find((a) => a.status === "pending");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow={newcomer.team}
        title={
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(newcomer.full_name)}</AvatarFallback>
            </Avatar>
            {newcomer.full_name}
            <StatusBadge status={newcomer.computed_status ?? newcomer.onboarding_status} />
          </div>
        }
        description={`${newcomer.job_title} · ${newcomer.seniority} · ${newcomer.completed_tasks}/${newcomer.total_tasks} tasks done`}
        actions={
          <>
            <Button variant="outline">
              <CalendarClock className="h-4 w-4" /> Schedule 15-min
            </Button>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4" /> Draft message
            </Button>
            <Button variant="ai" disabled={detectMut.isPending} onClick={() => detectMut.mutate()}>
              <Sparkles className="h-4 w-4" /> {detectMut.isPending ? "Detecting…" : "Detect signals"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">Plan progress</div>
            <ProgressBar value={progressPct} className="mt-3" tone="ai" />
            <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
              {newcomer.completed_tasks} of {newcomer.total_tasks} tasks done
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">Open signals</div>
            <div className="mt-2 text-2xl font-semibold">{openSignals.length}</div>
            <div className="text-xs text-[color:var(--color-fg-muted)]">{openSignals.length ? "AI suggests action" : "Nothing flagged"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">Blocked tasks</div>
            <div className="mt-2 text-2xl font-semibold">{newcomer.blocked_tasks}</div>
            <div className="text-xs text-[color:var(--color-fg-muted)]">{newcomer.start_date ? `Started ${newcomer.start_date}` : "—"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          {pendingAdjustment ? (
            <AIInsightCard
              title={pendingAdjustment.title ?? "Adaptive plan suggestion"}
              description="Based on this newcomer's signals, AI proposes adjusting the plan."
              confidence={84}
              actions={
                <>
                  <Button size="sm" variant="outline">
                    <GitBranch className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button size="sm" variant="ai">Approve changes</Button>
                </>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[color:var(--color-success-soft)] bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-success-fg)]">Strengths detected</div>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    <li>· API design</li>
                    <li>· SQL</li>
                    <li>· Code review understanding</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-[color:var(--color-warning-soft)] bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-warning-fg)]">Gaps detected</div>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    <li>· Deployment confidence</li>
                    <li>· Docker / K8s basics</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-[color:var(--color-primary-ring)] bg-white p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">Suggested changes</div>
                <ul className="mt-1 space-y-0.5 text-sm">
                  <li>+ Add deployment pairing session</li>
                  <li>+ Add staging deploy simulation</li>
                  <li>· Move first production deploy by 3 days</li>
                  <li>− Reduce basic API reading tasks</li>
                </ul>
              </div>
            </AIInsightCard>
          ) : null}

          <Tabs defaultValue="plan">
            <TabsList>
              <TabsTrigger value="plan">Plan</TabsTrigger>
              <TabsTrigger value="signals">Signals ({openSignals.length})</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>
            <TabsContent value="plan" className="space-y-5 pt-2">
              {plan.isLoading ? (
                <Skeleton className="h-48" />
              ) : tasks.length ? (
                <>
                  <PlanPhaseCard title="First 30 days" tasks={phase1} />
                  <PlanPhaseCard title="Days 31-60" tasks={phase2} />
                  <PlanPhaseCard title="Days 61-90" tasks={phase3} />
                </>
              ) : (
                <EmptyState
                  title="No plan yet"
                  description="Generate an AI plan for this newcomer to see tasks here."
                  action={
                    <Button asChild variant="ai">
                      <a href="/mentor/plan-generator">
                        <Sparkles className="h-4 w-4" /> Generate plan
                      </a>
                    </Button>
                  }
                />
              )}
            </TabsContent>
            <TabsContent value="signals" className="space-y-3 pt-2">
              {data.signals?.length ? (
                data.signals.map((s) => (
                  <SignalRow
                    key={s.id}
                    signal={s}
                    onResolve={(sig) => resolveMut.mutate(sig.id)}
                    onIgnore={(sig) => ignoreMut.mutate(sig.id)}
                    onSchedule={() => toast.message("Walkthrough draft", { description: "Calendar integration is a next step." })}
                  />
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="No signals yet"
                  description="Run detection to surface friction signals from engagement & question patterns."
                  action={
                    <Button variant="ai" onClick={() => detectMut.mutate()}>
                      <RefreshCcw className="h-4 w-4" /> Run detection
                    </Button>
                  }
                />
              )}
            </TabsContent>
            <TabsContent value="skills" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Skill / gap map</CardTitle>
                  <CardDescription>AI builds this from completed tasks, questions and signals.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillMap
                    rows={data.skill_map ?? [
                      { area: "API design", status: "strong" },
                      { area: "SQL", status: "strong" },
                      { area: "Codebase navigation", status: "medium" },
                      { area: "Deployment", status: "improving" },
                      { area: "Team rituals", status: "good" },
                      { area: "On-call", status: "not_started" },
                    ]}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[color:var(--color-primary)]" /> Adjustments
              </CardTitle>
              <CardDescription>Past AI plan adaptations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.adjustments && data.adjustments.length ? (
                data.adjustments.map((adj) => (
                  <div key={adj.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-primary)]" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[color:var(--color-fg)]">{adj.title}</div>
                      <div className="text-[11px] text-[color:var(--color-fg-subtle)]">
                        {adj.status} · {adj.created_at}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[color:var(--color-fg-muted)]">No adjustments yet.</p>
              )}
            </CardContent>
          </Card>

          {data.things_understood?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Things they now understand</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {data.things_understood.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
