"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  ChevronRight,
  Layers,
  Clock,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { fmtRelative } from "@/lib/format";
import type { Course } from "@/types";

interface CourseListProps {
  courses: Course[];
  /** "grid" (default) — visual cards. "compact" — dense list rows. */
  mode?: "grid" | "compact";
}

export function CourseList({ courses, mode = "grid" }: CourseListProps) {
  if (mode === "compact") {
    return (
      <ul className="overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]">
        {courses.map((c, i) => (
          <li
            key={c.id}
            className={cn(
              "border-b border-[color:var(--color-border)] last:border-b-0",
            )}
          >
            <CompactRow course={c} index={i} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c, i) => (
        <li key={c.id}>
          <CourseCard course={c} index={i} />
        </li>
      ))}
    </ul>
  );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const audience = course.role_target ? course.role_target.replace(/_/g, " ") : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.03, 0.18),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <Link
        href={`/mentor/courses/${course.id}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-[18px] border bg-white p-5 shadow-[var(--shadow-card)] transition-colors",
          course.generated_by_ai
            ? "border-[color:var(--color-primary-ring)]"
            : "border-[color:var(--color-border)]",
          "hover:border-[color:var(--color-primary)]",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60",
            course.generated_by_ai
              ? "ai-gradient"
              : "bg-[color:var(--color-primary-soft)]",
          )}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white",
              course.generated_by_ai
                ? "ai-gradient shadow-[var(--shadow-ai)]"
                : "bg-[color:var(--color-primary)] shadow-sm",
            )}
          >
            <BookOpen className="h-4 w-4" />
          </div>
          <ChevronRight className="h-4 w-4 text-[color:var(--color-fg-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--color-primary)]" />
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
          <Badge tone={statusTone(course.status)} size="sm">
            {prettyStatus(course.status)}
          </Badge>
          {course.generated_by_ai ? (
            <Badge tone="ai" size="sm">
              <Sparkles className="h-2.5 w-2.5" /> AI
            </Badge>
          ) : null}
        </div>

        <h3 className="relative mt-2 line-clamp-2 text-sm font-semibold tracking-tight text-[color:var(--color-fg)] group-hover:text-[color:var(--color-primary-active)]">
          {course.title}
        </h3>
        {course.summary ? (
          <p className="relative mt-1 line-clamp-2 text-xs text-[color:var(--color-fg-muted)]">
            {course.summary}
          </p>
        ) : null}

        <div className="relative mt-auto pt-4">
          <div className="flex items-center gap-3 text-[11px] text-[color:var(--color-fg-muted)]">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {course.lessons_count ?? 0} lesson
              {(course.lessons_count ?? 0) === 1 ? "" : "s"}
            </span>
            {audience ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> {audience}
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[color:var(--color-fg-subtle)]">
            <Clock className="h-3 w-3" />
            Updated {fmtRelative(course.updated_at ?? course.created_at)}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CompactRow({ course, index }: { course: Course; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.16) }}
    >
      <Link
        href={`/mentor/courses/${course.id}`}
        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[color:var(--color-surface-muted)]"
      >
        <div
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white",
            course.generated_by_ai
              ? "ai-gradient"
              : "bg-[color:var(--color-primary)]",
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-[color:var(--color-fg)] group-hover:text-[color:var(--color-primary-active)]">
            {course.title}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[color:var(--color-fg-muted)]">
            <Badge tone={statusTone(course.status)} size="sm">
              {prettyStatus(course.status)}
            </Badge>
            {course.generated_by_ai ? (
              <Badge tone="ai" size="sm">
                <Sparkles className="h-2.5 w-2.5" /> AI
              </Badge>
            ) : null}
            <span>·</span>
            <span>
              {course.lessons_count ?? 0} lesson
              {(course.lessons_count ?? 0) === 1 ? "" : "s"}
            </span>
            <span>·</span>
            <span>Updated {fmtRelative(course.updated_at ?? course.created_at)}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[color:var(--color-fg-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--color-primary)]" />
      </Link>
    </motion.div>
  );
}

function prettyStatus(status: string): string {
  return status.replace(/_/g, " ");
}

function statusTone(
  status: string,
): "neutral" | "success" | "warning" | "danger" | "info" | "ai" | "brand" {
  switch (status) {
    case "approved":
    case "published":
      return "success";
    case "rejected":
      return "danger";
    case "pending_approval":
      return "warning";
    case "draft":
      return "brand";
    default:
      return "neutral";
  }
}
