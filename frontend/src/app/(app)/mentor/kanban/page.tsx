"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FilterX,
  Layers3,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { KanbanBoard } from "@/components/mentor/kanban/KanbanBoard";
import { MentorTaskDetailSheet } from "@/components/mentor/kanban/MentorTaskDetailSheet";
import { ReturnFromReviewDialog } from "@/components/mentor/kanban/ReturnFromReviewDialog";
import {
  getMentorKanban,
  type KanbanQuery,
  type KanbanResponse,
  type KanbanStatus,
  type KanbanTaskCard,
} from "@/services/mentor-kanban";
import { updateTaskStatus } from "@/services/tasks";
import { useDemo } from "@/providers/demo-provider";
import { toApiError } from "@/lib/api";
import { emitNotificationsChanged } from "@/lib/notification-bus";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export default function MentorKanbanPage() {
  const { mentorId } = useDemo();
  const qc = useQueryClient();

  const [newcomerFilter, setNewcomerFilter] = React.useState<string>(ALL);
  const [priorityFilter, setPriorityFilter] = React.useState<string>(ALL);
  const [taskTypeFilter, setTaskTypeFilter] = React.useState<string>(ALL);
  const [signalFilter, setSignalFilter] = React.useState<string>(ALL);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const query: KanbanQuery = React.useMemo(
    () => ({
      newcomerId:
        newcomerFilter === ALL ? null : Number(newcomerFilter),
      priority: priorityFilter === ALL ? null : priorityFilter,
      taskType: taskTypeFilter === ALL ? null : taskTypeFilter,
      hasOpenSignal:
        signalFilter === ALL ? null : signalFilter === "yes",
      search: debouncedSearch || null,
    }),
    [
      newcomerFilter,
      priorityFilter,
      taskTypeFilter,
      signalFilter,
      debouncedSearch,
    ],
  );

  const kanban = useQuery({
    queryKey: ["mentor-kanban", mentorId, query],
    queryFn: () => getMentorKanban(mentorId!, query),
    enabled: !!mentorId,
  });

  const data: KanbanResponse | undefined = kanban.data;

  const [dialogTask, setDialogTask] = React.useState<KanbanTaskCard | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] =
    React.useState<KanbanTaskCard | null>(null);

  const statusMut = useMutation({
    mutationFn: async (vars: {
      taskId: number;
      status: KanbanTaskCard["status"];
      comment?: string;
    }) =>
      updateTaskStatus(vars.taskId, vars.status, {
        comment: vars.comment,
      }),
    onSuccess: (_, vars) => {
      if (vars.status === "in_progress" && vars.comment) {
        toast.success("Returned to newcomer", {
          description: "We notified them with your comment.",
        });
      } else if (vars.status === "done") {
        toast.success("Approved");
      } else {
        toast.success("Task moved");
      }
      qc.invalidateQueries({ queryKey: ["mentor-kanban"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      emitNotificationsChanged();
    },
    onError: (err) =>
      toast.error("Could not update task", {
        description: toApiError(err).message,
      }),
  });

  const handleDropCard = (card: KanbanTaskCard, target: KanbanStatus) => {
    if (card.status === "in_review" && target === "in_progress") {
      setDialogTask(card);
      setDialogOpen(true);
      return;
    }
    statusMut.mutate({ taskId: card.id, status: target });
  };

  const handleConfirmReturn = (comment: string) => {
    if (!dialogTask) return;
    statusMut.mutate(
      {
        taskId: dialogTask.id,
        status: "in_progress",
        comment,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setDialogTask(null);
        },
      },
    );
  };

  const totalCards = data
    ? Object.values(data.columns).reduce(
        (sum, list) => sum + list.length,
        0,
      )
    : 0;
  const inProgressCount = data?.columns.in_progress.length ?? 0;
  const inReviewCount = data?.columns.in_review.length ?? 0;
  const blockedCount = data?.columns.blocked.length ?? 0;
  const aiSignalCount = data
    ? Object.values(data.columns)
        .flat()
        .filter((card) => card.latest_signal).length
    : 0;
  const hasActiveFilters =
    newcomerFilter !== ALL ||
    priorityFilter !== ALL ||
    taskTypeFilter !== ALL ||
    signalFilter !== ALL ||
    search.trim().length > 0;
  const isBoardLoading = !!mentorId && kanban.isLoading;

  const resetFilters = () => {
    setNewcomerFilter(ALL);
    setPriorityFilter(ALL);
    setTaskTypeFilter(ALL);
    setSignalFilter(ALL);
    setSearch("");
  };

  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8"
      data-demo-id="mentor-kanban-page"
    >
      <section className="relative overflow-hidden rounded-[20px] border border-[color:var(--color-border)] bg-white px-5 py-5 shadow-[var(--shadow-card)] sm:px-6 sm:py-6">
        <AuroraBackground intensity="subtle" />
        <div className="relative">
          <div className="pointer-events-none absolute right-1 top-0 hidden sm:block">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary-ring)] bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)] shadow-[var(--shadow-card)] backdrop-blur">
              <Sparkles className="h-3 w-3" /> Live triage
            </span>
          </div>
          <PageHeader
            eyebrow="Mentor cockpit"
            title={
              <>
                Tasks <span className="ai-gradient-text">board</span>
              </>
            }
            description="A focused command view for follow-up, reviews, blockers, and AI-raised attention points across every newcomer."
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => kanban.refetch()}
                disabled={kanban.isFetching}
                className="gap-1.5 bg-white/80 backdrop-blur"
              >
                <RefreshCw
                  className={
                    kanban.isFetching
                      ? "h-3.5 w-3.5 animate-spin"
                      : "h-3.5 w-3.5"
                  }
                />
                Refresh
              </Button>
            }
          />
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <BoardStat
              label="Active tasks"
              value={isBoardLoading ? "..." : totalCards}
              hint={isBoardLoading ? "Loading board" : `${inProgressCount} in progress`}
              icon={Layers3}
            />
            <BoardStat
              label="Ready to review"
              value={isBoardLoading ? "..." : inReviewCount}
              hint={isBoardLoading ? "Loading board" : "Waiting on mentor action"}
              icon={CheckCircle2}
              tone="info"
            />
            <BoardStat
              label="Blocked"
              value={isBoardLoading ? "..." : blockedCount}
              hint={isBoardLoading ? "Loading board" : "Needs intervention"}
              icon={AlertTriangle}
              tone={blockedCount ? "danger" : "success"}
            />
            <BoardStat
              label="AI signals"
              value={isBoardLoading ? "..." : aiSignalCount}
              hint={isBoardLoading ? "Loading board" : "Open signal markers"}
              icon={Bot}
              tone="ai"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 p-3 shadow-[var(--shadow-card)] backdrop-blur">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative xl:min-w-[280px] xl:flex-[1.25]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-fg-subtle)]" />
            <Input
              placeholder="Search title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-[12px] border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-muted)]/40 pl-9"
            />
          </div>
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={newcomerFilter} onValueChange={setNewcomerFilter}>
              <SelectTrigger className="h-10 rounded-[12px]">
                <SelectValue placeholder="All newcomers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All newcomers</SelectItem>
                {data?.filters.newcomers.map((n) => (
                  <SelectItem key={n.id} value={String(n.id)}>
                    {n.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-10 rounded-[12px]">
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any priority</SelectItem>
                {(data?.filters.priorities ?? ["low", "medium", "high"]).map(
                  (p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
              <SelectTrigger className="h-10 rounded-[12px]">
                <SelectValue placeholder="Any task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any task type</SelectItem>
                {(data?.filters.task_types ?? []).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={signalFilter} onValueChange={setSignalFilter}>
              <SelectTrigger className="h-10 rounded-[12px]">
                <SelectValue placeholder="AI signal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>AI signal: any</SelectItem>
                <SelectItem value="yes">Has open signal</SelectItem>
                <SelectItem value="no">No open signal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-10 justify-center rounded-[12px] text-[color:var(--color-fg-muted)] xl:w-auto"
            >
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
          ) : null}
        </div>
      </section>

      <div className="flex flex-col gap-2 rounded-[14px] border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)]/60 px-3 py-2 text-xs text-[color:var(--color-fg-muted)] sm:flex-row sm:items-center">
        <span className="inline-flex items-center gap-2 font-medium text-[color:var(--color-primary-active)]">
          <Sparkles className="h-3.5 w-3.5" />
          AI priority queue
        </span>
        <span className="hidden h-4 w-px bg-[color:var(--color-primary-ring)] sm:block" />
        <span>
          Sorted by urgency, signal severity, and time in status.
        </span>
        <span className="font-semibold tabular-nums text-[color:var(--color-fg)] sm:ml-auto">
          {totalCards} active task{totalCards === 1 ? "" : "s"}
        </span>
      </div>

      {!mentorId ? (
        <div className="rounded-[18px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 p-8 text-center text-sm text-[color:var(--color-fg-muted)]">
          Pick a mentor persona to load the board.
        </div>
      ) : kanban.isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[60vh] rounded-[18px]" />
          ))}
        </div>
      ) : (
        <KanbanBoard
          data={data}
          onDropCard={handleDropCard}
          onCardClick={setSelectedTask}
        />
      )}

      <MentorTaskDetailSheet
        key={selectedTask?.id ?? "empty-task-detail"}
        open={!!selectedTask}
        card={selectedTask}
        mentorId={mentorId}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
      />

      {dialogOpen && dialogTask ? (
        <ReturnFromReviewDialog
          task={dialogTask}
          onCancel={() => {
            setDialogOpen(false);
            setDialogTask(null);
          }}
          onConfirm={handleConfirmReturn}
          submitting={statusMut.isPending}
        />
      ) : null}
    </div>
  );
}

type BoardStatTone = "default" | "success" | "danger" | "info" | "ai";

function BoardStat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: React.ElementType;
  tone?: BoardStatTone;
}) {
  const toneClass: Record<BoardStatTone, string> = {
    default:
      "bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)] border-[color:var(--color-border)]",
    success:
      "bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)] border-[color:var(--color-success-soft)]",
    danger:
      "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)] border-[color:var(--color-danger-soft)]",
    info: "bg-[color:var(--color-info-soft)] text-[color:var(--color-info-fg)] border-[color:var(--color-info-soft)]",
    ai: "ai-gradient text-white border-transparent",
  };

  return (
    <div className="rounded-[14px] border border-white/70 bg-white/80 p-3 shadow-[var(--shadow-card)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--color-fg)]">
            {value}
          </div>
          <div className="mt-0.5 text-xs text-[color:var(--color-fg-muted)]">
            {hint}
          </div>
        </div>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border",
            toneClass[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
