"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleDashed, Sparkles, BookOpen, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { Textarea } from "@/components/ui/textarea";

import { useDemo } from "@/providers/demo-provider";
import { getNewcomerPlan } from "@/services/newcomers";
import type { OnboardingTask } from "@/types";

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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const tasks = data?.tasks ?? [];
  const completed = tasks.filter((t) => t.status === "done");
  const inProgress = tasks.filter((t) => t.status === "in_progress" || t.status === "todo");
  const blocked = tasks.filter((t) => t.status === "blocked");
  const pct = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  const phase =
    pct >= 66 ? "Phase 3 — independent work" : pct >= 33 ? "Phase 2 — own a feature" : "Phase 1 — first PR";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Your progress"
        title="Where you are right now"
        description="Progress without the LMS vibe. Just what you've done, what's next, and what's still unclear."
      />

      <Card>
        <CardContent className="p-5">
          <ProgressBar value={pct} label={`${completed.length} of ${tasks.length} tasks complete`} tone="ai" />
          <div className="mt-2 text-xs text-[color:var(--color-fg-muted)]">Current phase: {phase}</div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <TaskGroup
          title="Completed"
          icon={CheckCircle2}
          tasks={completed}
          tone="success"
          emptyMsg="No completed tasks yet — that's normal early on."
        />
        <TaskGroup
          title="In progress"
          icon={CircleDashed}
          tasks={inProgress}
          tone="warning"
          emptyMsg="No active tasks."
        />
        {blocked.length ? (
          <TaskGroup
            title="Blocked"
            icon={AlertTriangle}
            tasks={blocked}
            tone="danger"
            emptyMsg=""
          />
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Things I now understand
            </CardTitle>
            <CardDescription>What AI sees you've internalized.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {["Who reviews backend PRs", "How Jira tickets move", "Where API documentation lives"].map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
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

function TaskGroup({
  title,
  tasks,
  icon: Icon,
  tone,
  emptyMsg,
}: {
  title: string;
  tasks: OnboardingTask[];
  icon: React.ComponentType<{ className?: string }>;
  tone: "success" | "warning" | "danger";
  emptyMsg: string;
}) {
  const toneClass: Record<string, string> = {
    success: "text-[color:var(--color-success-fg)]",
    warning: "text-[color:var(--color-warning-fg)]",
    danger: "text-[color:var(--color-danger-fg)]",
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${toneClass[tone]}`}>
          <Icon className="h-4 w-4" />
          {title}
          <span className="text-xs text-[color:var(--color-fg-muted)]">· {tasks.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {tasks.length ? (
          tasks.slice(0, 6).map((t) => (
            <Link
              key={t.id}
              href={`/newcomer/tasks/${t.id}`}
              className="block rounded-md px-2 py-1.5 text-sm text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-muted)] truncate"
            >
              · {t.title}
            </Link>
          ))
        ) : (
          <p className="text-xs text-[color:var(--color-fg-muted)]">{emptyMsg}</p>
        )}
      </CardContent>
    </Card>
  );
}
