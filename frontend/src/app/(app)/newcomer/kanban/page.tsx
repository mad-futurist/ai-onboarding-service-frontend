"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Eye,
  GripVertical,
  Loader2,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { useDemo } from "@/providers/demo-provider";
import { getNewcomerPlan } from "@/services/newcomers";
import { updateTaskStatus } from "@/services/tasks";
import { toApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { OnboardingTask } from "@/types";

const BOARD_STATUSES = [
  "todo",
  "in_progress",
  "in_review",
  "blocked",
  "done",
] as const;

type NewcomerKanbanStatus = (typeof BOARD_STATUSES)[number];

const STATUS_META: Record<
  NewcomerKanbanStatus,
  {
    label: string;
    short: string;
    icon: React.ComponentType<{ className?: string }>;
    column: string;
    rail: string;
  }
> = {
  todo: {
    label: "To do",
    short: "Queued",
    icon: CircleDashed,
    column:
      "border-t-4 border-t-[color:var(--color-border-strong)] bg-[color:var(--color-surface-muted)]/30",
    rail: "bg-[color:var(--color-border-strong)]",
  },
  in_progress: {
    label: "In progress",
    short: "Active",
    icon: PlayCircle,
    column:
      "border-t-4 border-t-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]/25",
    rail: "ai-gradient",
  },
  in_review: {
    label: "In review",
    short: "Mentor",
    icon: Eye,
    column:
      "border-t-4 border-t-[color:var(--color-info)] bg-[color:var(--color-info-soft)]/25",
    rail: "bg-[color:var(--color-info)]",
  },
  blocked: {
    label: "Blocked",
    short: "Help",
    icon: AlertTriangle,
    column:
      "border-t-4 border-t-[color:var(--color-danger)] bg-[color:var(--color-danger-soft)]/20",
    rail: "bg-[color:var(--color-danger)]",
  },
  done: {
    label: "Done",
    short: "Approved",
    icon: CheckCircle2,
    column:
      "border-t-4 border-t-[color:var(--color-success)] bg-[color:var(--color-success-soft)]/25",
    rail: "bg-[color:var(--color-success)]",
  },
};

export default function NewcomerKanbanPage() {
  const { newcomerId } = useDemo();
  const qc = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const planQuery = useQuery({
    queryKey: ["newcomer-plan", newcomerId],
    queryFn: () => getNewcomerPlan(newcomerId!),
    enabled: newcomerId !== null,
    retry: false,
  });

  const statusMut = useMutation({
    mutationFn: (vars: {
      task: OnboardingTask;
      target: NewcomerKanbanStatus;
    }) => updateTaskStatus(vars.task.id, vars.target),
    onSuccess: (_, vars) => {
      toast.success(statusToast(vars.target));
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
      qc.invalidateQueries({ queryKey: ["task-detail", vars.task.id] });
      qc.invalidateQueries({ queryKey: ["mentor-kanban"] });
    },
    onError: (err) => {
      toast.error("Could not move task", {
        description: toApiError(err).message,
      });
    },
  });

  const tasks = React.useMemo(
    () => [...(planQuery.data?.tasks ?? [])].sort(sortTasks),
    [planQuery.data?.tasks],
  );
  const columns = React.useMemo(() => groupTasks(tasks), [tasks]);
  const completed = columns.done.length;
  const inReview = columns.in_review.length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const task = active.data.current?.task as OnboardingTask | undefined;
    const target = parseColumnId(String(over.id));
    if (!task || !target || task.status === target) return;

    if (!canMoveAsNewcomer(task.status, target)) {
      toast.message(moveBlockedMessage(task.status, target));
      return;
    }

    statusMut.mutate({ task, target });
  };

  if (planQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-16 rounded-[18px]" />
        <div className="grid gap-4 lg:grid-cols-5">
          {BOARD_STATUSES.map((status) => (
            <Skeleton key={status} className="h-[62vh] rounded-[18px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!planQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={CircleDashed}
          title="Your plan is not ready yet"
          description="Your mentor is still preparing your onboarding tasks."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Your task flow"
        title="Tasks board"
        description="Move work from your queue into progress, then submit it for mentor review when it is ready."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => planQuery.refetch()}
            disabled={planQuery.isFetching}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", planQuery.isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        }
      />

      <section className="grid gap-3 rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-card)] md:grid-cols-[1fr_220px_160px]">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[color:var(--color-fg)]">
            {planQuery.data.title}
          </div>
          <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} total -{" "}
            {inReview} waiting for review
          </div>
        </div>
        <ProgressBar value={progress} label={`${completed}/${tasks.length} approved`} tone="ai" />
        <div className="flex items-center justify-start gap-2 md:justify-end">
          <Badge tone="info" size="lg">
            <Eye className="h-3 w-3" /> {inReview} review
          </Badge>
        </div>
      </section>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {BOARD_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columns[status]}
              pendingTaskId={statusMut.variables?.task.id}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  pendingTaskId,
}: {
  status: NewcomerKanbanStatus;
  tasks: OnboardingTask[];
  pendingTaskId?: number;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `newcomer-column-${status}`,
  });
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[58vh] flex-col rounded-[18px] border border-[color:var(--color-border)] p-3 transition-colors",
        meta.column,
        isOver && "ring-2 ring-[color:var(--color-primary-ring)]",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white shadow-sm">
            <Icon className="h-4 w-4 text-[color:var(--color-fg-muted)]" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[color:var(--color-fg)]">
              {meta.label}
            </h2>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-fg-subtle)]">
              {meta.short}
            </div>
          </div>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[color:var(--color-fg-muted)]">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              status={status}
              pending={pendingTaskId === task.id}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white/70 p-6 text-center text-xs text-[color:var(--color-fg-subtle)]">
            No tasks
          </div>
        )}
      </div>
    </section>
  );
}

function TaskCard({
  task,
  status,
  pending,
}: {
  task: OnboardingTask;
  status: NewcomerKanbanStatus;
  pending: boolean;
}) {
  const draggable = canDragStatus(status);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `newcomer-task-${task.id}`,
      data: { task },
      disabled: !draggable,
    });
  const meta = STATUS_META[status];

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-[color:var(--color-border)] bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "ring-2 ring-[color:var(--color-primary-ring)]",
      )}
    >
      <span
        className={cn("absolute bottom-3 left-0 top-3 w-[3px] rounded-r", meta.rail)}
        aria-hidden
      />
      <div className="flex items-start gap-2 pl-1">
        <button
          type="button"
          className={cn(
            "mt-0.5 text-[color:var(--color-fg-subtle)]",
            draggable
              ? "cursor-grab hover:text-[color:var(--color-fg-muted)] active:cursor-grabbing"
              : "cursor-not-allowed opacity-40",
          )}
          aria-label={draggable ? "Drag task" : "Task cannot be moved"}
          {...(draggable ? attributes : {})}
          {...(draggable ? listeners : {})}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GripVertical className="h-4 w-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {task.week_number ? (
              <Badge tone="neutral" size="sm">
                <Clock3 className="h-2.5 w-2.5" /> Week {task.week_number}
              </Badge>
            ) : null}
          </div>
          <Link
            href={`/newcomer/tasks/${task.id}`}
            className="mt-2 block text-sm font-medium leading-snug text-[color:var(--color-fg)] hover:text-[color:var(--color-primary-active)]"
          >
            {task.title}
          </Link>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
              {task.description}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-end">
            <Link
              href={`/newcomer/tasks/${task.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-primary-active)] hover:text-[color:var(--color-primary)]"
            >
              Open <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function groupTasks(tasks: OnboardingTask[]) {
  const columns: Record<NewcomerKanbanStatus, OnboardingTask[]> = {
    todo: [],
    in_progress: [],
    in_review: [],
    blocked: [],
    done: [],
  };

  for (const task of tasks) {
    const status = isBoardStatus(task.status) ? task.status : "todo";
    columns[status].push(task);
  }

  return columns;
}

function sortTasks(a: OnboardingTask, b: OnboardingTask) {
  return (
    (a.week_number ?? 999) - (b.week_number ?? 999) ||
    (a.day_number ?? 999) - (b.day_number ?? 999) ||
    a.id - b.id
  );
}

function isBoardStatus(status: string): status is NewcomerKanbanStatus {
  return BOARD_STATUSES.includes(status as NewcomerKanbanStatus);
}

function parseColumnId(id: string): NewcomerKanbanStatus | null {
  const raw = id.replace("newcomer-column-", "");
  return isBoardStatus(raw) ? raw : null;
}

function canDragStatus(status: NewcomerKanbanStatus) {
  return status !== "in_review" && status !== "done";
}

function canMoveAsNewcomer(current: string, target: NewcomerKanbanStatus) {
  if (current === "todo") return target === "in_progress" || target === "blocked";
  if (current === "in_progress") {
    return target === "todo" || target === "in_review" || target === "blocked";
  }
  if (current === "blocked") return target === "in_progress" || target === "todo";
  return false;
}

function moveBlockedMessage(current: string, target: NewcomerKanbanStatus) {
  if (target === "done") return "Mentor approval moves a task to Done.";
  if (current === "todo" && target === "in_review") {
    return "Start the task before submitting it for review.";
  }
  if (current === "in_review") return "This task is waiting for mentor review.";
  if (current === "done") return "Approved tasks stay in Done.";
  return "That status change is not available here.";
}

function statusToast(target: NewcomerKanbanStatus) {
  switch (target) {
    case "in_progress":
      return "Task started";
    case "in_review":
      return "Submitted for review";
    case "blocked":
      return "Task marked blocked";
    case "todo":
      return "Task moved back to queue";
    default:
      return "Task moved";
  }
}
