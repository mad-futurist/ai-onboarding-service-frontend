"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCcw, Plus, Sparkles, Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { PlanBreadcrumb } from "@/components/mentor/plan-generator/PlanBreadcrumb";
import { SortableTaskList } from "@/components/mentor/plan-generator/SortableTaskList";

import { getPlan, listWeeks, regeneratePlan, updateWeek } from "@/services/plans";
import { aiGenerateTask, createTask, updateTask } from "@/services/tasks";
import { toApiError } from "@/lib/api";
import type { ID } from "@/types";

export default function WeekDetailPage() {
  const params = useParams<{ planId: string; weekId: string }>();
  const planId = Number(params.planId);
  const weekId = Number(params.weekId);
  const qc = useQueryClient();

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId),
    enabled: Number.isFinite(planId),
  });

  const { data: weeks } = useQuery({
    queryKey: ["plan-weeks", planId],
    queryFn: () => listWeeks(planId),
    enabled: Number.isFinite(planId),
  });

  const week = weeks?.find((w) => w.id === weekId);
  const weekTasks = React.useMemo(() => {
    if (!plan?.tasks) return [];
    return plan.tasks
      .filter((t) => t.week_id === weekId || (week && t.week_number === week.index))
      .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0));
  }, [plan, weekId, week]);

  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [goalsText, setGoalsText] = React.useState("");
  const [syncedWeekId, setSyncedWeekId] = React.useState<ID | null>(null);
  if (week && syncedWeekId !== week.id) {
    setSyncedWeekId(week.id);
    setTitle(week.title);
    setSummary(week.summary ?? "");
    setGoalsText((week.goals ?? []).join("\n"));
  }

  const saveWeekMut = useMutation({
    mutationFn: () =>
      updateWeek(weekId, {
        title: title.trim(),
        summary: summary.trim() || null,
        goals:
          goalsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
      }),
    onSuccess: () => {
      toast.success("Week saved");
      qc.invalidateQueries({ queryKey: ["plan-weeks", planId] });
    },
    onError: (err) => toast.error("Save failed", { description: toApiError(err).message }),
  });

  const regenWeekMut = useMutation({
    mutationFn: (mentor_notes?: string) =>
      regeneratePlan(planId, {
        scope: "week",
        target_id: weekId,
        preserve_manual_edits: true,
        mentor_notes,
      }),
    onSuccess: (resp) => {
      toast.success("Week regenerated", {
        description: `${resp.affected_task_ids.length} tasks updated${resp.used_fallback ? " (fallback)" : ""}.`,
      });
      qc.invalidateQueries({ queryKey: ["plan", planId] });
      qc.invalidateQueries({ queryKey: ["plan-weeks", planId] });
    },
    onError: (err) =>
      toast.error("Regenerate failed", { description: toApiError(err).message }),
  });

  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [aiPrompt, setAIPrompt] = React.useState("");

  const createTaskMut = useMutation({
    mutationFn: () =>
      createTask({
        plan_id: planId,
        title: newTaskTitle.trim(),
        week_id: weekId,
        week_number: week?.index,
        day_number: weekTasks.length + 1,
      }),
    onSuccess: () => {
      toast.success("Task added");
      setNewTaskTitle("");
      qc.invalidateQueries({ queryKey: ["plan", planId] });
    },
    onError: (err) => toast.error("Create failed", { description: toApiError(err).message }),
  });

  const aiTaskMut = useMutation({
    mutationFn: () =>
      aiGenerateTask({
        plan_id: planId,
        week_id: weekId,
        prompt_hint: aiPrompt.trim(),
      }),
    onSuccess: () => {
      toast.success("AI task drafted");
      setAIPrompt("");
      qc.invalidateQueries({ queryKey: ["plan", planId] });
    },
    onError: (err) => toast.error("AI failed", { description: toApiError(err).message }),
  });

  const reorderMut = useMutation({
    mutationFn: async (orderedIds: ID[]) => {
      await Promise.all(
        orderedIds.map((id, i) =>
          updateTask(id, { day_number: i + 1, week_id: weekId, week_number: week?.index }),
        ),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plan", planId] }),
    onError: (err) => toast.error("Reorder failed", { description: toApiError(err).message }),
  });

  if (planLoading || !plan || !week) {
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

  return (
    <>
      <PlanBreadcrumb
        crumbs={[
          { label: "Plan generator", href: "/mentor/plan-generator" },
          { label: plan.title, href: `/mentor/plan-generator/${plan.id}` },
          { label: `Week ${week.index}` },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveWeekMut.mutate()}
              disabled={saveWeekMut.isPending}
            >
              {saveWeekMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save week
            </Button>
            <Button
              variant="ai"
              size="sm"
              onClick={() => regenWeekMut.mutate(undefined)}
              disabled={regenWeekMut.isPending}
            >
              <RefreshCcw className="h-3.5 w-3.5" />{" "}
              {regenWeekMut.isPending ? "Regenerating…" : "Regenerate week"}
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Week {week.index}</CardTitle>
              <CardDescription>Frame the week so the AI can hit the right beats.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="wk-title">Title</Label>
                <Input id="wk-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wk-summary">Summary</Label>
                <Textarea
                  id="wk-summary"
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wk-goals">Goals (one per line)</Label>
                <Textarea
                  id="wk-goals"
                  rows={4}
                  value={goalsText}
                  onChange={(e) => setGoalsText(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[color:var(--color-primary)]" /> Add task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTaskTitle.trim()) return;
                  createTaskMut.mutate();
                }}
                className="space-y-2"
              >
                <Input
                  placeholder="Manual task title…"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createTaskMut.isPending || !newTaskTitle.trim()}
                  className="w-full"
                >
                  <Plus className="h-3.5 w-3.5" /> Add manual task
                </Button>
              </form>
              <div className="space-y-2 border-t border-[color:var(--color-border)] pt-3">
                <Label>AI draft</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. read deployment guide and ship a 'hello world' to staging."
                  value={aiPrompt}
                  onChange={(e) => setAIPrompt(e.target.value)}
                />
                <Button
                  variant="ai"
                  size="sm"
                  className="w-full"
                  disabled={aiTaskMut.isPending || !aiPrompt.trim()}
                  onClick={() => aiTaskMut.mutate()}
                >
                  <Sparkles className="h-3.5 w-3.5" />{" "}
                  {aiTaskMut.isPending ? "Drafting…" : "Generate task with AI"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tasks · {weekTasks.length}</CardTitle>
                  <CardDescription>
                    Drag rows to reorder. Click a task title to edit fields and run AI suggestions.
                  </CardDescription>
                </div>
                {weekTasks.some((t) => (t.manually_edited_fields?.length ?? 0) > 0) ? (
                  <Badge tone="ai" size="sm">
                    Edited fields preserved on regenerate
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <SortableTaskList
                tasks={weekTasks}
                taskHref={(taskId) => `/mentor/plan-generator/${plan.id}/task/${taskId}`}
                onReorder={(ids) => reorderMut.mutate(ids)}
                emptyHint="No tasks in this week yet. Add one manually or let the AI draft one."
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
