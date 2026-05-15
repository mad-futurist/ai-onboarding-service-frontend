"use client";

import * as React from "react";
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
import {
  GripVertical,
  Plus,
  BookOpen,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Lesson, CourseWithLessons, ID } from "@/types";

interface LessonTreeProps {
  course: CourseWithLessons;
  selectedLessonId: ID | null;
  onSelect: (id: ID) => void;
  onReorder: (orderedIds: ID[]) => void;
  onCreateManual: (title: string) => void;
  onCreateAI: (title: string, summary: string) => void;
  onDelete: (id: ID) => void;
  creating?: boolean;
  aiCreating?: boolean;
}

export function LessonTree({
  course,
  selectedLessonId,
  onSelect,
  onReorder,
  onCreateManual,
  onCreateAI,
  onDelete,
  creating,
  aiCreating,
}: LessonTreeProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const lessons = React.useMemo(() => course.lessons ?? [], [course.lessons]);
  const [items, setItems] = React.useState<ID[]>(() => lessons.map((l) => l.id));
  const [prevLessonIds, setPrevLessonIds] = React.useState<string>(
    () => lessons.map((l) => l.id).join(","),
  );
  const nextLessonIds = lessons.map((l) => l.id).join(",");
  if (prevLessonIds !== nextLessonIds) {
    setPrevLessonIds(nextLessonIds);
    setItems(lessons.map((l) => l.id));
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
    const map = new Map<ID, Lesson>();
    for (const l of lessons) map.set(l.id, l);
    return map;
  }, [lessons]);

  const [mode, setMode] = React.useState<"none" | "manual" | "ai">("none");
  const [newTitle, setNewTitle] = React.useState("");
  const [newSummary, setNewSummary] = React.useState("");

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-3">
      <header className="px-2 pt-1 pb-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          <BookOpen className="h-3 w-3" /> Lessons · {lessons.length}
        </div>
        <h2 className="mt-1 truncate text-sm font-semibold text-[color:var(--color-fg)]">
          {course.title}
        </h2>
        {course.summary ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--color-fg-muted)]">
            {course.summary}
          </p>
        ) : null}
        <div className="mt-2">
          <Badge tone={statusTone(course.status)} size="sm">
            {course.status}
          </Badge>
        </div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ol className="space-y-1">
            {items.map((id, idx) => {
              const lesson = byId.get(id);
              if (!lesson) return null;
              return (
                <SortableLesson
                  key={id}
                  lesson={lesson}
                  position={idx + 1}
                  active={selectedLessonId === id}
                  onSelect={() => onSelect(id)}
                  onDelete={() => {
                    if (confirm(`Delete "${lesson.title}"? This cannot be undone.`)) {
                      onDelete(id);
                    }
                  }}
                />
              );
            })}
          </ol>
        </SortableContext>
      </DndContext>

      {!lessons.length ? (
        <div className="rounded-lg border border-dashed border-[color:var(--color-border)] p-3 text-xs text-[color:var(--color-fg-muted)]">
          No lessons yet. Add one below.
        </div>
      ) : null}

      <div className="space-y-2 border-t border-[color:var(--color-border)] pt-3">
        {mode === "none" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setMode("manual")}>
              <Plus className="h-3.5 w-3.5" /> Manual
            </Button>
            <Button variant="ai" size="sm" onClick={() => setMode("ai")}>
              <Sparkles className="h-3.5 w-3.5" /> With AI
            </Button>
          </div>
        ) : null}

        {mode === "manual" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim()) return;
              onCreateManual(newTitle.trim());
              setNewTitle("");
              setMode("none");
            }}
            className="space-y-2"
          >
            <Input
              autoFocus
              placeholder="Lesson title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex gap-1.5">
              <Button type="submit" size="sm" disabled={creating || !newTitle.trim()}>
                Add
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setMode("none")}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {mode === "ai" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim() || !newSummary.trim()) return;
              onCreateAI(newTitle.trim(), newSummary.trim());
              setNewTitle("");
              setNewSummary("");
              setMode("none");
            }}
            className="space-y-2"
          >
            <Input
              autoFocus
              placeholder="Lesson title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              rows={3}
              placeholder="Short summary so the AI knows what to teach…"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
            />
            <div className="flex gap-1.5">
              <Button
                type="submit"
                variant="ai"
                size="sm"
                disabled={aiCreating || !newTitle.trim() || !newSummary.trim()}
              >
                {aiCreating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setMode("none")}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </aside>
  );
}

function SortableLesson({
  lesson,
  position,
  active,
  onSelect,
  onDelete,
}: {
  lesson: Lesson;
  position: number;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 rounded-lg border px-1.5 py-1.5 transition-colors",
        active
          ? "border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)]"
          : "border-transparent hover:bg-[color:var(--color-surface-muted)]",
        isDragging && "shadow-[var(--shadow-elevated)]",
      )}
    >
      <button
        type="button"
        className="grid h-6 w-5 cursor-grab place-items-center rounded text-[color:var(--color-fg-faint)] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag lesson"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 min-w-0 items-start gap-2 rounded text-left"
      >
        <span
          className={cn(
            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-semibold",
            active
              ? "bg-[color:var(--color-primary)] text-white"
              : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
          )}
        >
          {position}
        </span>
        <span
          className={cn(
            "min-w-0 truncate text-sm",
            active
              ? "font-medium text-[color:var(--color-primary-active)]"
              : "text-[color:var(--color-fg)]",
          )}
        >
          {lesson.title}
        </span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="grid h-6 w-6 place-items-center rounded text-[color:var(--color-fg-faint)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[color:var(--color-danger-soft)] hover:text-[color:var(--color-danger-fg)]"
        aria-label="Delete lesson"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </li>
  );
}

function statusTone(status: string): "neutral" | "success" | "warning" | "danger" | "info" | "ai" | "brand" {
  switch (status) {
    case "approved":
    case "published":
      return "success";
    case "rejected":
      return "danger";
    case "pending_approval":
      return "warning";
    case "draft":
      return "ai";
    default:
      return "neutral";
  }
}
