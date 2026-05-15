"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCcw, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanBreadcrumb } from "@/components/mentor/plan-generator/PlanBreadcrumb";
import { TaskEditor } from "@/components/mentor/plan-generator/TaskEditor";

import { getPlan, listWeeks, regeneratePlan } from "@/services/plans";
import { deleteTask, getTask, updateTask } from "@/services/tasks";
import { toApiError } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function TaskDetailPage() {
  const params = useParams<{ planId: string; taskId: string }>();
  const planId = Number(params.planId);
  const taskId = Number(params.taskId);
  const qc = useQueryClient();
  const router = useRouter();

  const { data: plan } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId),
    enabled: Number.isFinite(planId),
  });
  const { data: weeks } = useQuery({
    queryKey: ["plan-weeks", planId],
    queryFn: () => listWeeks(planId),
    enabled: Number.isFinite(planId),
  });
  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
    enabled: Number.isFinite(taskId),
  });

  const week = React.useMemo(() => {
    if (!task) return null;
    if (task.week_id) return weeks?.find((w) => w.id === task.week_id) ?? null;
    if (task.week_number) return weeks?.find((w) => w.index === task.week_number) ?? null;
    return null;
  }, [task, weeks]);

  const saveMut = useMutation({
    mutationFn: (patch: Parameters<typeof updateTask>[1]) => updateTask(taskId, patch),
    onSuccess: () => {
      toast.success("Task saved");
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["plan", planId] });
    },
    onError: (err) => toast.error("Save failed", { description: toApiError(err).message }),
  });

  const regenMut = useMutation({
    mutationFn: () =>
      regeneratePlan(planId, {
        scope: "task",
        target_id: taskId,
        preserve_manual_edits: true,
      }),
    onSuccess: (resp) => {
      toast.success("Task regenerated", {
        description: resp.summary,
      });
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["plan", planId] });
    },
    onError: (err) =>
      toast.error("Regenerate failed", { description: toApiError(err).message }),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      toast.success("Task deleted");
      qc.invalidateQueries({ queryKey: ["plan", planId] });
      if (week) {
        router.push(`/mentor/plan-generator/${planId}/week/${week.id}`);
      } else {
        router.push(`/mentor/plan-generator/${planId}/workspace`);
      }
    },
    onError: (err) => toast.error("Delete failed", { description: toApiError(err).message }),
  });

  if (isLoading || !task || !plan) {
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

  const crumbs = [
    { label: "Plan generator", href: "/mentor/plan-generator" },
    { label: plan.title, href: `/mentor/plan-generator/${plan.id}` },
    { label: "Workspace", href: `/mentor/plan-generator/${plan.id}/workspace` },
    ...(week
      ? [{ label: `Week ${week.index}`, href: `/mentor/plan-generator/${plan.id}/week/${week.id}` }]
      : []),
    { label: task.title },
  ];

  return (
    <>
      <PlanBreadcrumb
        crumbs={crumbs}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => regenMut.mutate()}
              disabled={regenMut.isPending}
            >
              {regenMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCcw className="h-3.5 w-3.5" />
              )}
              Regenerate task
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Delete this task? This cannot be undone.")) deleteMut.mutate();
              }}
              disabled={deleteMut.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </>
        }
      />

      <TaskEditor
        task={task}
        saving={saveMut.isPending}
        onSave={async (patch) => {
          await saveMut.mutateAsync(patch);
        }}
      />
    </>
  );
}
