"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  Trophy,
  Layers,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeProgress } from "@/lib/course-progress";
import type { Course } from "@/types";

interface CourseProgressCardProps {
  course: Course;
  completedCount: number;
  /** Falls back to course.lessons_count when omitted. */
  totalLessons?: number | null;
  /** When true, the card uses the brighter "assigned to you" styling. */
  highlighted?: boolean;
}

export function CourseProgressCard({
  course,
  completedCount,
  totalLessons,
  highlighted = false,
}: CourseProgressCardProps) {
  const total = totalLessons ?? course.lessons_count ?? null;
  const { pct, done, total: totalDisplay, complete } = computeProgress(
    completedCount,
    total,
  );

  const cta = complete
    ? "Review"
    : done > 0
      ? "Continue"
      : "Start course";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="h-full"
    >
      <Link
        href={`/newcomer/courses/${course.id}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-[18px] border bg-white p-5 transition-colors",
          highlighted
            ? "border-[color:var(--color-primary-ring)] shadow-[var(--shadow-card)] hover:border-[color:var(--color-primary)]"
            : "border-[color:var(--color-border)] shadow-[var(--shadow-card)] hover:border-[color:var(--color-primary-ring)]",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60",
            highlighted ? "ai-gradient" : "bg-[color:var(--color-primary-soft)]",
          )}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white",
              highlighted
                ? "ai-gradient shadow-[var(--shadow-ai)]"
                : "bg-[color:var(--color-primary)] shadow-sm",
            )}
          >
            {complete ? (
              <Trophy className="h-4 w-4" />
            ) : done > 0 ? (
              <Play className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {course.generated_by_ai ? (
              <Badge tone="ai" size="sm">
                <Sparkles className="h-2.5 w-2.5" /> AI
              </Badge>
            ) : null}
            {course.role_target ? (
              <Badge tone="neutral" size="sm">
                {course.role_target.replace(/_/g, " ")}
              </Badge>
            ) : null}
            {complete ? (
              <Badge tone="success" size="sm">
                <CheckCircle2 className="h-2.5 w-2.5" /> Done
              </Badge>
            ) : null}
          </div>
        </div>

        <h3 className="relative mt-3 line-clamp-2 text-sm font-semibold tracking-tight text-[color:var(--color-fg)] group-hover:text-[color:var(--color-primary-active)]">
          {course.title}
        </h3>
        {course.summary ? (
          <p className="relative mt-1 line-clamp-2 text-xs text-[color:var(--color-fg-muted)]">
            {course.summary}
          </p>
        ) : null}

        <div className="relative mt-auto pt-4">
          <div className="flex items-center justify-between text-[11px] text-[color:var(--color-fg-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3 w-3" />
              {totalDisplay > 0
                ? `${done} / ${totalDisplay} lessons`
                : `${done} lessons read`}
            </span>
            <span className="tabular-nums font-medium text-[color:var(--color-fg)]">
              {pct}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
            <motion.div
              className="h-full ai-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-medium text-[color:var(--color-primary-active)]">
              {cta}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-[color:var(--color-primary)] transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
