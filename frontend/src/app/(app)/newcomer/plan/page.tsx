"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  CircleDashed,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  Map,
  LayoutList,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { CountUp } from "@/components/shared/CountUp";
import { EmptyState } from "@/components/shared/EmptyState";
import { PlanJourneyTimeline } from "@/components/newcomer/plan/PlanJourneyTimeline";

import { useDemo } from "@/providers/demo-provider";
import { getNewcomerPlan } from "@/services/newcomers";
import { cn } from "@/lib/utils";
import type { OnboardingTask } from "@/types";

const PHASES = [
  { id: 1, label: "Phase 1 — First 30 days", min: 0, max: 30, goal: "Understand team, codebase, and ship first PR" },
  { id: 2, label: "Phase 2 — Days 31-60", min: 30, max: 60, goal: "Own a small feature end-to-end" },
  { id: 3, label: "Phase 3 — Days 61-90", min: 60, max: 9999, goal: "Work independently on team tasks" },
];

const VIEW_KEY = "newcomer.plan.view";
type ViewKey = "journey" | "phases";

export default function MyPlanPage() {
  const { newcomerId, guidedDemoActive } = useDemo();
  const { data, isLoading } = useQuery({
    queryKey: ["newcomer-plan", newcomerId],
    queryFn: () => getNewcomerPlan(newcomerId!),
    enabled: newcomerId !== null,
    retry: false,
  });

  const [view, setView] = React.useState<ViewKey>("journey");
  const [viewLoaded, setViewLoaded] = React.useState(false);

  if (!viewLoaded) {
    setViewLoaded(true);
    try {
      const stored =
        typeof window !== "undefined" ? window.localStorage.getItem(VIEW_KEY) : null;
      if (!guidedDemoActive && (stored === "journey" || stored === "phases")) {
        setView(stored);
      }
    } catch {
      // ignore
    }
  }

  if (guidedDemoActive && view !== "journey") {
    setView("journey");
  }

  const onTabChange = (next: string) => {
    const v = (next === "phases" ? "phases" : "journey") as ViewKey;
    setView(v);
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(VIEW_KEY, v);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-3">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <EmptyState
          icon={Sparkles}
          title="Your plan isn't ready yet"
          description="Your mentor is still preparing it. You'll get a notification the moment it's available."
        />
      </div>
    );
  }

  const tasks = data.tasks ?? [];
  const completed = tasks.filter((t) => t.status === "done").length;
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Your onboarding plan"
        title={data.title}
        description={data.description ?? "A 30/60/90 plan crafted by AI and approved by your mentor."}
        actions={
          <Badge tone={data.mentor_approved ? "success" : "warning"} size="lg">
            {data.mentor_approved ? "Mentor approved" : "Awaiting approval"}
          </Badge>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-5 p-5">
          <div className="min-w-[220px] flex-1">
            <ProgressBar
              value={pct}
              label={`Overall progress · ${completed} of ${tasks.length} tasks`}
              tone="ai"
              showValue={false}
            />
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={pct} size={64} stroke={6} tone="ai" />
            <div className="text-right">
              <div className="text-3xl font-semibold tracking-tight tabular-nums text-[color:var(--color-fg)]">
                <CountUp value={pct} suffix="%" />
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                Complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={onTabChange} data-demo-id="newcomer-plan-tabs">
        <TabsList>
          <TabsTrigger value="journey" className="gap-1.5" data-demo-id="newcomer-plan-journey-tab">
            <Map className="h-3.5 w-3.5" /> Journey
          </TabsTrigger>
          <TabsTrigger value="phases" className="gap-1.5">
            <LayoutList className="h-3.5 w-3.5" /> Phases
          </TabsTrigger>
        </TabsList>
        <TabsContent value="journey">
          <PlanJourneyTimeline tasks={tasks} />
        </TabsContent>
        <TabsContent value="phases">
          <div className="space-y-4">
            {PHASES.map((phase) => {
              const phaseTasks = tasks.filter((t) => {
                const day = t.day_number ?? (t.week_number ?? 1) * 7;
                return day > phase.min && day <= phase.max;
              });
              return (
                <PhaseSection
                  key={phase.id}
                  phase={phase}
                  tasks={phaseTasks}
                  initialOpen={phase.id === 1}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PhaseSection({
  phase,
  tasks,
  initialOpen,
}: {
  phase: { id: number; label: string; min: number; max: number; goal: string };
  tasks: OnboardingTask[];
  initialOpen?: boolean;
}) {
  const [open, setOpen] = React.useState<boolean>(!!initialOpen);
  const completed = tasks.filter((t) => t.status === "done").length;

  const grouped = React.useMemo(() => {
    const out: Record<string, OnboardingTask[]> = {};
    for (const t of tasks) {
      const wk = String(t.week_number ?? 0);
      out[wk] ??= [];
      out[wk].push(t);
    }
    return out;
  }, [tasks]);

  return (
    <section className="rounded-[14px] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="h-4 w-4 text-[color:var(--color-fg-muted)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[color:var(--color-fg-muted)]" />
          )}
          <div>
            <div className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">{phase.label}</div>
            <div className="text-xs text-[color:var(--color-fg-muted)]">{phase.goal}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-[color:var(--color-fg-muted)] tabular-nums">
            {completed}/{tasks.length}
          </span>
          <div className="w-24">
            <ProgressBar value={tasks.length ? (completed / tasks.length) * 100 : 0} showValue={false} tone="ai" />
          </div>
        </div>
      </button>
      {open ? (
        <div className="border-t border-[color:var(--color-border)] px-5 py-4 space-y-4">
          {tasks.length === 0 ? (
            <p className="text-sm text-[color:var(--color-fg-muted)]">No tasks in this phase yet.</p>
          ) : (
            Object.entries(grouped)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([wk, ts]) => (
                <div key={wk}>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    {wk === "0" ? "Anytime" : `Week ${wk}`}
                  </div>
                  <ul className="space-y-1.5">
                    {ts.map((t) => (
                      <TaskItem key={t.id} task={t} />
                    ))}
                  </ul>
                </div>
              ))
          )}
        </div>
      ) : null}
    </section>
  );
}

function TaskItem({ task }: { task: OnboardingTask }) {
  const Icon = task.status === "done" ? Check : task.status === "blocked" ? AlertTriangle : CircleDashed;
  const tone =
    task.status === "done"
      ? "text-[color:var(--color-success)]"
      : task.status === "blocked"
        ? "text-[color:var(--color-danger)]"
        : "text-[color:var(--color-fg-faint)]";
  return (
    <li>
      <Link
        href={`/newcomer/tasks/${task.id}`}
        className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)]/40"
      >
        <Icon className={cn("h-4 w-4 shrink-0", tone)} />
        <div className={cn("min-w-0 flex-1", task.status === "done" && "line-through text-[color:var(--color-fg-muted)]")}>
          <div className="text-sm text-[color:var(--color-fg)] truncate">{task.title}</div>
          {task.description ? (
            <div className="text-xs text-[color:var(--color-fg-muted)] line-clamp-1">{task.description}</div>
          ) : null}
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
      </Link>
    </li>
  );
}
