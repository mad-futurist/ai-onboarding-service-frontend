"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  CalendarDays,
  Clock,
  GripVertical,
  MessageSquare,
  Sparkles,
  Undo2,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  humanizeSignalType,
  PRIORITY_TONE,
  SEVERITY_TONE,
} from "@/lib/constants";
import type { KanbanTaskCard as KanbanTaskCardData } from "@/services/mentor-kanban";

interface Props {
  card: KanbanTaskCardData;
  onClick?: (card: KanbanTaskCardData) => void;
}

const TONE_CLASSES: Record<string, string> = {
  success:
    "border-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)] bg-[color:var(--color-success-soft)]/30",
  warning:
    "border-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)] bg-[color:var(--color-warning-soft)]/30",
  danger:
    "border-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)] bg-[color:var(--color-danger-soft)]/30",
  info: "border-[color:var(--color-info-soft)] text-[color:var(--color-info-fg)] bg-[color:var(--color-info-soft)]/30",
  neutral:
    "border-[color:var(--color-border)] text-[color:var(--color-fg-muted)]",
  ai: "border-[color:var(--color-primary-ring)] text-[color:var(--color-primary-active)] bg-[color:var(--color-primary-soft)]",
};

const ACCENT_CLASSES: Record<string, string> = {
  success: "bg-[color:var(--color-success)]",
  warning: "bg-[color:var(--color-warning)]",
  danger: "bg-[color:var(--color-danger)]",
  info: "bg-[color:var(--color-info)]",
  neutral: "bg-[color:var(--color-border-strong)]",
  ai: "ai-gradient",
};

function toneClass(tone: string | undefined) {
  return TONE_CLASSES[tone ?? "neutral"] ?? TONE_CLASSES.neutral;
}

function accentClass(tone: string | undefined) {
  return ACCENT_CLASSES[tone ?? "neutral"] ?? ACCENT_CLASSES.neutral;
}

function initials(name: string) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return letters || "NC";
}

export function KanbanTaskCardItem({ card, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `task-${card.id}`,
      data: { card },
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1,
  };

  const priorityTone = PRIORITY_TONE[card.priority] ?? "neutral";
  const severityTone = card.latest_signal
    ? (SEVERITY_TONE[card.latest_signal.severity] ?? "neutral")
    : "neutral";
  const urgencyTone =
    card.urgency_score >= 10
      ? "danger"
      : card.urgency_score >= 6
        ? "warning"
        : "neutral";
  const placement = card.week_number
    ? `W${card.week_number}${card.day_number ? ` / D${card.day_number}` : ""}`
    : card.task_type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)] transition-[border-color,box-shadow,background-color] hover:border-[color:var(--color-primary-ring)] hover:shadow-[var(--shadow-elevated)]",
        isDragging && "ring-2 ring-[color:var(--color-primary-ring)]",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", accentClass(priorityTone))}
      />
      <div className="flex items-start gap-2 p-3 pl-4">
        <button
          type="button"
          className="mt-0.5 cursor-grab rounded-md p-1 text-[color:var(--color-fg-subtle)] opacity-70 transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg-muted)] hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag task"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onClick?.(card)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                toneClass(priorityTone),
              )}
            >
              {card.priority}
            </span>
            {card.review_return_count >= 2 ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                  toneClass("danger"),
                )}
              >
                <Undo2 className="h-3 w-3" />
                Returned {card.review_return_count}x
              </span>
            ) : null}
            {card.latest_signal ? (
              <span
                className={cn(
                  "inline-flex max-w-full items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                  toneClass(severityTone),
                )}
                title={card.latest_signal.title}
              >
                <Sparkles className="h-3 w-3" />
                <span className="truncate">
                  {humanizeSignalType(card.latest_signal.signal_type)}
                </span>
              </span>
            ) : null}
          </div>
          <div className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-[color:var(--color-fg)]">
            {card.title}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--color-surface-muted)] text-[10px] font-semibold text-[color:var(--color-fg-muted)]">
                {initials(card.newcomer.full_name)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-[color:var(--color-fg)]">
                  {card.newcomer.full_name}
                </div>
                <div className="truncate text-[11px] text-[color:var(--color-fg-subtle)]">
                  {card.newcomer.job_title ?? card.newcomer.team ?? "Newcomer"}
                </div>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                toneClass(urgencyTone),
              )}
            >
              {card.urgency_score}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[color:var(--color-fg-muted)]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {card.days_in_status}d in lane
            </span>
            {placement ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {placement}
              </span>
            ) : null}
            {card.last_comment?.comment_type === "review_return" ? (
              <span
                className="inline-flex items-center gap-1 text-[color:var(--color-danger-fg)]"
                title={card.last_comment.body}
              >
                <MessageSquare className="h-3 w-3" />
                review note
              </span>
            ) : null}
            {card.urgency_score >= 10 ? (
              <span className="inline-flex items-center gap-1 text-[color:var(--color-warning-fg)]">
                <AlertCircle className="h-3 w-3" />
                urgent
              </span>
            ) : null}
          </div>
        </button>
        <UserRound className="mt-1 hidden h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-faint)] sm:block" />
      </div>
    </div>
  );
}
