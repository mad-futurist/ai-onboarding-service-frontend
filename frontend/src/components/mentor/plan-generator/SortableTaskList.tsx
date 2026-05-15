"use client";

import * as React from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, CircleDashed, AlertTriangle, Edit3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/shared/StatusBadge";
import type { OnboardingTask, ID } from "@/types";

interface SortableTaskListProps {
  tasks: OnboardingTask[];
  taskHref: (taskId: ID) => string;
  onReorder: (orderedIds: ID[]) => void;
  emptyHint?: React.ReactNode;
}

export function SortableTaskList({
  tasks,
  taskHref,
  onReorder,
  emptyHint,
}: SortableTaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [items, setItems] = React.useState<ID[]>(() => tasks.map((t) => t.id));
  const [prevTaskIds, setPrevTaskIds] = React.useState<string>(
    () => tasks.map((t) => t.id).join(","),
  );
  const nextTaskIds = tasks.map((t) => t.id).join(",");
  if (prevTaskIds !== nextTaskIds) {
    setPrevTaskIds(nextTaskIds);
    setItems(tasks.map((t) => t.id));
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.indexOf(active.id as ID);
      const newIndex = prev.indexOf(over.id as ID);
      const next = arrayMove(prev, oldIndex, newIndex);
      onReorder(next);
      return next;
    });
  };

  const byId = React.useMemo(() => {
    const map = new Map<ID, OnboardingTask>();
    for (const t of tasks) map.set(t.id, t);
    return map;
  }, [tasks]);

  if (!tasks.length) {
    return (
      <div className="rounded-lg border border-dashed border-[color:var(--color-border)] bg-white px-4 py-6 text-center text-sm text-[color:var(--color-fg-muted)]">
        {emptyHint ?? "No tasks yet."}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1.5">
          {items.map((id) => {
            const task = byId.get(id);
            if (!task) return null;
            return <SortableTaskRow key={id} task={task} href={taskHref(id)} />;
          })}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableTaskRow({ task, href }: { task: OnboardingTask; href: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon =
    task.status === "done"
      ? Check
      : task.status === "blocked"
        ? AlertTriangle
        : CircleDashed;
  const iconColor =
    task.status === "done"
      ? "text-[color:var(--color-success)]"
      : task.status === "blocked"
        ? "text-[color:var(--color-danger)]"
        : "text-[color:var(--color-fg-faint)]";

  const edited = (task.manually_edited_fields?.length ?? 0) > 0;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-2 py-2 shadow-[var(--shadow-card)] transition-shadow",
        isDragging && "ring-2 ring-[color:var(--color-primary-ring)] shadow-[var(--shadow-elevated)]",
      )}
    >
      <button
        type="button"
        className="grid h-6 w-5 cursor-grab place-items-center rounded text-[color:var(--color-fg-faint)] hover:text-[color:var(--color-fg-muted)] active:cursor-grabbing"
        aria-label="Drag task"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
      <Link href={href} className="flex min-w-0 flex-1 items-center justify-between gap-2 group">
        <div className="min-w-0">
          <div
            className={cn(
              "truncate text-sm text-[color:var(--color-fg)] group-hover:text-[color:var(--color-primary-active)]",
              task.status === "done" && "line-through text-[color:var(--color-fg-muted)]",
            )}
          >
            {task.title}
          </div>
          {task.description ? (
            <div className="line-clamp-1 text-xs text-[color:var(--color-fg-muted)]">
              {task.description}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {edited ? (
            <span
              className="grid h-5 w-5 place-items-center rounded-md bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
              title="Edited manually"
            >
              <Edit3 className="h-3 w-3" />
            </span>
          ) : null}
          {task.priority ? <PriorityBadge priority={task.priority} size="sm" /> : null}
        </div>
      </Link>
    </li>
  );
}
