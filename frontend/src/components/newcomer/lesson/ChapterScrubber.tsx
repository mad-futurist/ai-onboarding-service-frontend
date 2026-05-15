"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Lesson, ID } from "@/types";

interface ChapterScrubberProps {
  lessons: Lesson[];
  selectedId: ID | null;
  completed: Set<ID>;
  onSelect: (id: ID) => void;
}

export function ChapterScrubber({
  lessons,
  selectedId,
  completed,
  onSelect,
}: ChapterScrubberProps) {
  if (lessons.length === 0) return null;
  return (
    <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 border-b border-[color:var(--color-border)] bg-white/85 px-4 sm:px-6 py-2 backdrop-blur">
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {lessons.map((l, i) => {
          const isActive = selectedId === l.id;
          const isDone = completed.has(l.id);
          return (
            <motion.button
              key={l.id}
              type="button"
              onClick={() => onSelect(l.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                isActive
                  ? "ai-border bg-white text-[color:var(--color-primary-active)] shadow-[var(--shadow-card)]"
                  : isDone
                    ? "border-[color:var(--color-success-soft)] bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]"
                    : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)]",
              )}
              aria-current={isActive ? "step" : undefined}
              data-active={isActive ? "true" : undefined}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute -left-0.5 -right-0.5 -top-0.5 -bottom-0.5 rounded-full animate-[signal-pulse_2.4s_ease-in-out_infinite]"
                />
              ) : null}
              <span className="relative grid h-4 w-4 place-items-center rounded-full bg-[color:var(--color-surface-muted)] text-[10px] font-semibold text-[color:var(--color-fg)]">
                {isDone ? <Check className="h-2.5 w-2.5 text-[color:var(--color-success)]" /> : i + 1}
              </span>
              <span className="max-w-[160px] truncate font-medium">{displayTitle(l)}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function displayTitle(lesson: Lesson) {
  const title = lesson.title?.trim();
  if (!title || /^lesson\s+\d+$/i.test(title)) return `Lesson ${lesson.index}`;
  return title;
}
