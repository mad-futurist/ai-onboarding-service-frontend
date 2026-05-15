"use client";

import Link from "next/link";
import { BookOpen, Sparkles, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { fmtRelative } from "@/lib/format";
import type { Course } from "@/types";

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <Link
          key={c.id}
          href={`/mentor/courses/${c.id}`}
          className={cn(
            "group rounded-[14px] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)] transition-colors hover:border-[color:var(--color-primary-ring)]",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
              <BookOpen className="h-4 w-4" />
            </div>
            <ChevronRight className="h-4 w-4 text-[color:var(--color-fg-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--color-primary)]" />
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <Badge tone={statusTone(c.status)} size="sm">
              {c.status}
            </Badge>
            {c.generated_by_ai ? (
              <Badge tone="ai" size="sm">
                <Sparkles className="h-2.5 w-2.5" /> AI
              </Badge>
            ) : null}
            {c.role_target ? (
              <Badge tone="neutral" size="sm">
                {c.role_target.replace(/_/g, " ")}
              </Badge>
            ) : null}
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-semibold tracking-tight text-[color:var(--color-fg)] group-hover:text-[color:var(--color-primary-active)]">
            {c.title}
          </h3>
          {c.summary ? (
            <p className="mt-1 line-clamp-2 text-xs text-[color:var(--color-fg-muted)]">
              {c.summary}
            </p>
          ) : null}
          <div className="mt-3 text-[11px] text-[color:var(--color-fg-subtle)]">
            Updated {fmtRelative(c.updated_at ?? c.created_at)}
          </div>
        </Link>
      ))}
    </div>
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
      return "brand";
    default:
      return "neutral";
  }
}
