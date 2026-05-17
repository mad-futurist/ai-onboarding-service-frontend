"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/constants";
import { KanbanTaskCardItem } from "./KanbanTaskCard";
import type {
  KanbanStatus,
  KanbanTaskCard as KanbanTaskCardData,
} from "@/services/mentor-kanban";

const COLUMN_TONE: Record<KanbanStatus, string> = {
  in_progress:
    "border-t-4 border-t-[color:var(--color-warning)] bg-[color:var(--color-surface-muted)]/30",
  in_review:
    "border-t-4 border-t-[color:var(--color-info)] bg-[color:var(--color-surface-muted)]/30",
  blocked:
    "border-t-4 border-t-[color:var(--color-danger)] bg-[color:var(--color-surface-muted)]/30",
};

interface Props {
  status: KanbanStatus;
  cards: KanbanTaskCardData[];
  onCardClick?: (card: KanbanTaskCardData) => void;
}

export function KanbanColumn({ status, cards, onCardClick }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${status}` });

  void STATUS_TONE; // tone is implicit via COLUMN_TONE map

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-[60vh] flex-col rounded-2xl border border-[color:var(--color-border)] p-3 transition-colors",
        COLUMN_TONE[status],
        isOver && "ring-2 ring-[color:var(--color-primary-ring)]",
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
          {STATUS_LABEL[status] ?? status}
        </h3>
        <span className="text-xs text-[color:var(--color-fg-muted)]">
          {cards.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {cards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-xs text-[color:var(--color-fg-subtle)]">
            Drop a card here
          </div>
        ) : (
          cards.map((card) => (
            <KanbanTaskCardItem
              key={card.id}
              card={card}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
