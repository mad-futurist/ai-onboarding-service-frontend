"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Search, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Mentor cockpit"
        title="Tasks board"
        description="Triage every active task across your newcomers. Drag a card across columns to update its status. Returning a task from In review back to In progress requires a comment."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => kanban.refetch()}
            disabled={kanban.isFetching}
            className="gap-1.5"
          >
            <RefreshCw
              className={
                kanban.isFetching ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"
              }
            />
            Refresh
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-[color:var(--color-fg-subtle)]" />
          <Input
            placeholder="Search title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={newcomerFilter} onValueChange={setNewcomerFilter}>
          <SelectTrigger>
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
          <SelectTrigger>
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
          <SelectTrigger>
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
          <SelectTrigger>
            <SelectValue placeholder="AI signal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>AI signal: any</SelectItem>
            <SelectItem value="yes">Has open signal</SelectItem>
            <SelectItem value="no">No open signal</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <div className="flex items-center gap-2 text-xs text-[color:var(--color-fg-muted)]">
        <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
        AI sorts every column by urgency (priority + open signal severity +
        days in status). {totalCards} active task
        {totalCards === 1 ? "" : "s"}.
      </div>

      {!mentorId ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-8 text-center text-sm text-[color:var(--color-fg-muted)]">
          Pick a mentor persona to load the board.
        </div>
      ) : kanban.isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[60vh] rounded-2xl" />
          ))}
        </div>
      ) : (
        <KanbanBoard data={data} onDropCard={handleDropCard} />
      )}

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
