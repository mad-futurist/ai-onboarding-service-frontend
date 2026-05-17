"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  ArrowRight,
  Flame,
  Eye,
  Loader2,
  MessageSquare,
  PlayCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toApiError } from "@/lib/api";
import { listTaskComments } from "@/services/task-comments";
import { updateTaskStatus } from "@/services/tasks";
import type { OnboardingTask } from "@/types";

interface TaskRowProps {
  task: OnboardingTask;
  href?: string;
  /** When true, render newcomer-side actions like "Submit for review". */
  showActions?: boolean;
}

export function TaskRow({ task, href, showActions }: TaskRowProps) {
  const tone = statusTone(task.status);
  const dayLabel = formatDay(task);
  const qc = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ["task-comments", task.id],
    queryFn: () => listTaskComments(task.id),
    enabled: showActions === true && task.status === "in_progress",
  });

  const latestReturn = React.useMemo(() => {
    const list = commentsQuery.data ?? [];
    return list.find((c) => c.comment_type === "review_return") ?? null;
  }, [commentsQuery.data]);

  const submitMut = useMutation({
    mutationFn: () => updateTaskStatus(task.id, "in_review"),
    onSuccess: () => {
      toast.success("Submitted for review", {
        description: "Your mentor will review and respond.",
      });
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
      qc.invalidateQueries({ queryKey: ["task-detail", task.id] });
      qc.invalidateQueries({ queryKey: ["task-comments", task.id] });
      qc.invalidateQueries({ queryKey: ["mentor-kanban"] });
    },
    onError: (err) =>
      toast.error("Could not submit", {
        description: toApiError(err).message,
      }),
  });

  const startMut = useMutation({
    mutationFn: () => updateTaskStatus(task.id, "in_progress"),
    onSuccess: () => {
      toast.success("Task started");
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
      qc.invalidateQueries({ queryKey: ["task-detail", task.id] });
      qc.invalidateQueries({ queryKey: ["mentor-kanban"] });
    },
    onError: (err) =>
      toast.error("Could not start task", {
        description: toApiError(err).message,
      }),
  });

  const inner = (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition-colors",
        tone.border,
        "hover:border-[color:var(--color-primary-ring)]",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-2 bottom-2 w-[3px] rounded-r",
          tone.rail,
        )}
        aria-hidden
      />
      <div
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
          tone.iconBg,
        )}
      >
        <StatusIcon
          status={task.status}
          className={cn("h-3.5 w-3.5", tone.iconColor)}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {dayLabel ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              {dayLabel}
            </span>
          ) : null}
          {task.priority === "high" ? (
            <Badge tone="danger" size="sm">
              <Flame className="h-2.5 w-2.5" /> High
            </Badge>
          ) : null}
          {task.status === "in_review" ? (
            <Badge tone="info" size="sm">
              <Eye className="h-2.5 w-2.5" /> In review
            </Badge>
          ) : null}
        </div>
        <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">
          {task.title}
        </div>
      </div>
      {href ? (
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-faint)] transition-colors group-hover:text-[color:var(--color-primary)]" />
      ) : null}
    </motion.div>
  );

  const wrapped = href ? (
    <Link href={href} aria-label={`Open task: ${task.title}`}>
      {inner}
    </Link>
  ) : (
    inner
  );

  if (!showActions) return wrapped;

  return (
    <div className="space-y-1.5">
      {wrapped}
      {task.status === "in_progress" && latestReturn ? (
        <div className="ml-7 rounded-lg border border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)]/30 p-2 text-xs text-[color:var(--color-fg)]">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-danger-fg)]">
            <MessageSquare className="h-3 w-3" />
            Mentor review note
          </div>
          <p className="mt-0.5 whitespace-pre-wrap text-[color:var(--color-fg-muted)]">
            {latestReturn.body}
          </p>
        </div>
      ) : null}
      {task.status === "todo" ? (
        <div className="ml-7">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startMut.mutate();
            }}
            disabled={startMut.isPending}
          >
            {startMut.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5" />
            )}
            Start task
          </Button>
        </div>
      ) : task.status === "in_progress" ? (
        <div className="ml-7">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              submitMut.mutate();
            }}
            disabled={submitMut.isPending}
          >
            {submitMut.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Submit for review
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function formatDay(task: OnboardingTask): string | null {
  if (task.day_number != null) return `Day ${task.day_number}`;
  if (task.week_number != null) return `Week ${task.week_number}`;
  return null;
}

function StatusIcon({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  switch (status) {
    case "done":
      return <CheckCircle2 className={className} />;
    case "blocked":
      return <AlertTriangle className={className} />;
    case "in_review":
      return <Eye className={className} />;
    default:
      return <CircleDashed className={className} />;
  }
}

interface ToneClasses {
  border: string;
  rail: string;
  iconBg: string;
  iconColor: string;
}

function statusTone(status: string): ToneClasses {
  switch (status) {
    case "done":
      return {
        border: "border-[color:var(--color-success-soft)]",
        rail: "bg-[color:var(--color-success)]",
        iconBg: "bg-[color:var(--color-success-soft)]",
        iconColor: "text-[color:var(--color-success-fg)]",
      };
    case "blocked":
      return {
        border: "border-[color:var(--color-danger-soft)]",
        rail: "bg-[color:var(--color-danger)]",
        iconBg: "bg-[color:var(--color-danger-soft)]",
        iconColor: "text-[color:var(--color-danger-fg)]",
      };
    case "in_progress":
      return {
        border: "border-[color:var(--color-primary-ring)]",
        rail: "ai-gradient",
        iconBg: "bg-[color:var(--color-primary-soft)]",
        iconColor: "text-[color:var(--color-primary-active)]",
      };
    case "in_review":
      return {
        border: "border-[color:var(--color-info-soft)]",
        rail: "bg-[color:var(--color-info)]",
        iconBg: "bg-[color:var(--color-info-soft)]",
        iconColor: "text-[color:var(--color-info-fg)]",
      };
    default:
      return {
        border: "border-[color:var(--color-border)]",
        rail: "bg-[color:var(--color-border-strong)]",
        iconBg: "bg-[color:var(--color-surface-muted)]",
        iconColor: "text-[color:var(--color-fg-muted)]",
      };
  }
}
