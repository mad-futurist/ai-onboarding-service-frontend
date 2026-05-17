"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  AlertTriangle,
  ClipboardCheck,
  Hourglass,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/constants";
import { KanbanTaskCardItem } from "./KanbanTaskCard";
import type {
  KanbanStatus,
  KanbanTaskCard as KanbanTaskCardData,
} from "@/services/mentor-kanban";

const COLUMN_THEME: Record<
  KanbanStatus,
  {
    icon: LucideIcon;
    kicker: string;
    bar: string;
    shell: string;
    iconTone: string;
    countTone: string;
    emptyTone: string;
  }
> = {
  in_progress: {
    icon: Hourglass,
    kicker: "Momentum",
    bar: "bg-[color:var(--color-warning)]",
    shell: "bg-[color:var(--color-warning-soft)]/20",
    iconTone:
      "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)]",
    countTone:
      "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)]",
    emptyTone:
      "bg-[color:var(--color-warning-soft)]/30 text-[color:var(--color-warning-fg)]",
  },
  in_review: {
    icon: ClipboardCheck,
    kicker: "Validation",
    bar: "bg-[color:var(--color-info)]",
    shell: "bg-[color:var(--color-info-soft)]/20",
    iconTone:
      "bg-[color:var(--color-info-soft)] text-[color:var(--color-info-fg)]",
    countTone:
      "bg-[color:var(--color-info-soft)] text-[color:var(--color-info-fg)]",
    emptyTone:
      "bg-[color:var(--color-info-soft)]/30 text-[color:var(--color-info-fg)]",
  },
  blocked: {
    icon: AlertTriangle,
    kicker: "Intervention",
    bar: "bg-[color:var(--color-danger)]",
    shell: "bg-[color:var(--color-danger-soft)]/20",
    iconTone:
      "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)]",
    countTone:
      "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)]",
    emptyTone:
      "bg-[color:var(--color-danger-soft)]/30 text-[color:var(--color-danger-fg)]",
  },
};

interface Props {
  status: KanbanStatus;
  cards: KanbanTaskCardData[];
  onCardClick?: (card: KanbanTaskCardData) => void;
}

export function KanbanColumn({ status, cards, onCardClick }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${status}` });
  const theme = COLUMN_THEME[status];
  const Icon = theme.icon;

  return (
    <div
      ref={setNodeRef}
      data-demo-id={`mentor-kanban-column-${status}`}
      className={cn(
        "flex h-full min-h-[64vh] flex-col overflow-hidden rounded-[18px] border border-[color:var(--color-border)] shadow-[var(--shadow-card)] transition-all",
        theme.shell,
        isOver &&
          "scale-[1.01] border-[color:var(--color-primary-ring)] ring-2 ring-[color:var(--color-primary-ring)]",
      )}
    >
      <span aria-hidden className={cn("h-1 w-full", theme.bar)} />
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/78 p-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-[10px]",
              theme.iconTone,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              {theme.kicker}
            </div>
            <h3 className="truncate text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
              {STATUS_LABEL[status] ?? status}
            </h3>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums",
            theme.countTone,
          )}
        >
          {cards.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {cards.length === 0 ? (
          <div
            className={cn(
              "grid min-h-28 place-items-center rounded-[14px] border border-dashed border-[color:var(--color-border)] p-6 text-center text-xs font-medium",
              theme.emptyTone,
            )}
          >
            Drop a card here
          </div>
        ) : (
          cards.map((card, index) => (
            <KanbanTaskCardItem
              key={card.id}
              card={card}
              onClick={onCardClick}
              isFirst={index === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
