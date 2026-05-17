"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  Sparkles,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

import { ProgressHero } from "@/components/newcomer/progress/ProgressHero";
import { WeeklyVelocity } from "@/components/newcomer/progress/WeeklyVelocity";
import { MilestoneTrack } from "@/components/newcomer/progress/MilestoneTrack";
import { TaskRow } from "@/components/newcomer/progress/TaskRow";

import { useDemo } from "@/providers/demo-provider";
import { getNewcomerPlan } from "@/services/newcomers";
import type { OnboardingTask } from "@/types";

const FALLBACK_INSIGHTS = [
  "Who reviews backend PRs",
  "How Jira tickets move",
  "Where API documentation lives",
];

export default function NewcomerProgressPage() {
  const { newcomerId } = useDemo();
  const { data, isLoading } = useQuery({
    queryKey: ["newcomer-plan", newcomerId],
    queryFn: () => getNewcomerPlan(newcomerId!),
    enabled: newcomerId !== null,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <Skeleton className="h-56 rounded-[24px]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-44 rounded-[18px]" />
          <Skeleton className="h-44 rounded-[18px]" />
        </div>
        <Skeleton className="h-60 rounded-[18px]" />
      </div>
    );
  }

  const tasks: OnboardingTask[] = data?.tasks ?? [];
  const completed = tasks.filter((t) => t.status === "done");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const inReview = tasks.filter((t) => t.status === "in_review");
  const todo = tasks.filter((t) => t.status === "todo");
  const blocked = tasks.filter((t) => t.status === "blocked");

  const focusTasks = [...inProgress, ...todo].slice(0, 4);
  const recentlyDone = [...completed]
    .sort((a, b) => (b.id as number) - (a.id as number))
    .slice(0, 4);

  const thisWeekHint = computeWeekHint(tasks);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div data-demo-id="newcomer-progress-hero">
        <ProgressHero
          completedCount={completed.length}
          inProgressCount={inProgress.length}
          blockedCount={blocked.length}
          todoCount={todo.length}
          hint={thisWeekHint}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div data-demo-id="newcomer-progress-velocity">
          <WeeklyVelocity tasks={tasks} />
        </div>
        <MilestoneTrack tasks={tasks} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TaskListCard
          title="Focus right now"
          eyebrow="Active"
          icon={CircleDashed}
          tasks={focusTasks}
          empty="Nothing in your queue — pick a todo from your plan."
        />
        <TaskListCard
          title="Recently completed"
          eyebrow="Wins"
          icon={CheckCircle2}
          tasks={recentlyDone}
          empty="No completed tasks yet — that's normal early on."
        />
        <TaskListCard
          title="Waiting for review"
          eyebrow="Review"
          icon={Sparkles}
          tasks={inReview.slice(0, 4)}
          empty="No tasks are waiting for mentor review."
        />
        {blocked.length > 0 ? (
          <TaskListCard
            title="Blocked"
            eyebrow="Needs attention"
            icon={AlertTriangle}
            tasks={blocked}
            tone="danger"
            empty=""
          />
        ) : null}
        <UnderstoodCard items={FALLBACK_INSIGHTS} />
      </div>

      <AIInsightCard
        title="Still unclear?"
        description="Tell AI what's confusing — it'll surface relevant docs and route signals to your mentor only if you want."
        tone="soft"
        actions={
          <Button asChild variant="ai" size="sm">
            <Link href="/newcomer/ask">
              <Sparkles className="h-3.5 w-3.5" /> Ask AI
            </Link>
          </Button>
        }
      >
        <Textarea
          rows={3}
          placeholder="e.g. I don't fully get the staging deploy step."
          className="bg-white"
        />
      </AIInsightCard>
    </div>
  );
}

function TaskListCard({
  title,
  eyebrow,
  icon: Icon,
  tasks,
  empty,
  tone = "default",
}: {
  title: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: OnboardingTask[];
  empty: string;
  tone?: "default" | "danger";
}) {
  const eyebrowClass =
    tone === "danger"
      ? "text-[color:var(--color-danger-fg)]"
      : "text-[color:var(--color-primary-active)]";
  return (
    <section className="rounded-[18px] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div
            className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${eyebrowClass}`}
          >
            <Icon className="h-3 w-3" /> {eyebrow}
          </div>
          <div className="mt-0.5 text-sm font-semibold tracking-tight">{title}</div>
        </div>
        <span className="text-xs text-[color:var(--color-fg-muted)] tabular-nums">
          {tasks.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {tasks.length === 0 ? (
          <li className="rounded-lg border border-dashed border-[color:var(--color-border)] px-3 py-4 text-center text-xs text-[color:var(--color-fg-muted)]">
            {empty}
          </li>
        ) : (
          tasks.map((t) => (
            <li key={t.id}>
              <TaskRow task={t} href={`/newcomer/tasks/${t.id}`} showActions />
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function UnderstoodCard({ items }: { items: string[] }) {
  return (
    <section className="ai-border relative overflow-hidden rounded-[18px] bg-white p-5">
      <div className="absolute inset-0 ai-gradient-soft opacity-30" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
          <BookOpen className="h-3 w-3" /> Insight
        </div>
        <div className="mt-0.5 text-sm font-semibold tracking-tight">
          Things you now understand
        </div>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-[color:var(--color-fg)]"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-primary)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function computeWeekHint(tasks: OnboardingTask[]): string | undefined {
  if (!tasks.length) return undefined;
  // Best-effort "current week" = highest week_number that has at least one done task,
  // or fall back to the highest started week.
  const doneByWeek = new Map<number, number>();
  let highestStartedWeek = 0;
  for (const t of tasks) {
    const w =
      t.week_number ??
      (t.day_number ? Math.ceil(t.day_number / 7) : null);
    if (w == null) continue;
    if (t.status !== "todo") highestStartedWeek = Math.max(highestStartedWeek, w);
    if (t.status === "done") doneByWeek.set(w, (doneByWeek.get(w) ?? 0) + 1);
  }
  if (!highestStartedWeek) return undefined;
  const doneThisWeek = doneByWeek.get(highestStartedWeek) ?? 0;
  if (doneThisWeek === 0) return undefined;
  return `${doneThisWeek} task${doneThisWeek > 1 ? "s" : ""} shipped this week`;
}
