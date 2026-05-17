"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { KanbanColumn } from "./KanbanColumn";
import type {
  KanbanResponse,
  KanbanStatus,
  KanbanTaskCard,
} from "@/services/mentor-kanban";

const COLUMN_ORDER: KanbanStatus[] = ["in_progress", "in_review", "blocked"];

interface Props {
  data: KanbanResponse;
  onDropCard: (card: KanbanTaskCard, targetStatus: KanbanStatus) => void;
  onCardClick?: (card: KanbanTaskCard) => void;
}

export function KanbanBoard({ data, onDropCard, onCardClick }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith("column-")) return;
    const targetStatus = overId.replace("column-", "") as KanbanStatus;
    const card = active.data.current?.card as KanbanTaskCard | undefined;
    if (!card) return;
    if (card.status === targetStatus) return;
    onDropCard(card, targetStatus);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            cards={data.columns[status] ?? []}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
