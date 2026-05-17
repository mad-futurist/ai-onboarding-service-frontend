"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  Clock,
  GripVertical,
  MessageSquare,
  Sparkles,
  Undo2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_TONE, SEVERITY_TONE } from "@/lib/constants";
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

function toneClass(tone: string | undefined) {
  return TONE_CLASSES[tone ?? "neutral"] ?? TONE_CLASSES.neutral;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 shadow-sm hover:shadow-md transition-shadow",
        isDragging && "ring-2 ring-[color:var(--color-primary-ring)]",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg-muted)] active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag task"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onClick?.(card)}
          className="flex-1 text-left"
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
                  "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                  toneClass(severityTone),
                )}
                title={card.latest_signal.title}
              >
                <Sparkles className="h-3 w-3" />
                {card.latest_signal.signal_type}
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 text-sm font-medium leading-snug text-[color:var(--color-fg)]">
            {card.title}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[color:var(--color-fg-muted)]">
            <Badge tone="neutral" size="sm">
              {card.newcomer.full_name}
            </Badge>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {card.days_in_status}d
            </span>
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
      </div>
    </div>
  );
}
