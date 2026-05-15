"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, LayoutGroup } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Sparkles,
  Search,
  LayoutGrid,
  Rows3,
  ArrowRight,
  Layers,
  CheckCircle2,
  Clock,
  Wand2,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { CountUp } from "@/components/shared/CountUp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CourseList } from "@/components/mentor/courses/CourseList";

import { listCourses } from "@/services/courses";
import { useDemo } from "@/providers/demo-provider";
import type { Course } from "@/types";

type StatusFilter =
  | "all"
  | "draft"
  | "pending_approval"
  | "approved"
  | "published";

type ViewMode = "grid" | "compact";

const VIEW_STORAGE_KEY = "mentor.courses.view";

export default function CoursesIndexPage() {
  const { mentorId } = useDemo();

  const { data, isLoading } = useQuery({
    queryKey: ["courses", mentorId],
    queryFn: () =>
      listCourses({
        mentor_id: mentorId ?? undefined,
      }),
  });

  const all = React.useMemo<Course[]>(() => data ?? [], [data]);

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState<ViewMode>("grid");
  const [viewHydrated, setViewHydrated] = React.useState(false);

  if (!viewHydrated) {
    setViewHydrated(true);
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
        if (stored === "compact" || stored === "grid") setView(stored);
      } catch {
        // ignore
      }
    }
  }

  React.useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // ignore
    }
  }, [view]);

  const counts = React.useMemo(() => {
    const c = {
      total: all.length,
      draft: 0,
      pending_approval: 0,
      approved: 0,
      published: 0,
      rejected: 0,
      ai_drafted: 0,
      total_lessons: 0,
    };
    for (const course of all) {
      if (course.status in c) {
        (c as Record<string, number>)[course.status] += 1;
      }
      if (course.generated_by_ai) c.ai_drafted += 1;
      c.total_lessons += course.lessons_count ?? 0;
    }
    return c;
  }, [all]);

  const aiPct = counts.total ? Math.round((counts.ai_drafted / counts.total) * 100) : 0;

  const filtered = React.useMemo(() => {
    return all.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const haystack =
          `${c.title} ${c.summary ?? ""} ${c.role_target ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [all, statusFilter, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <PageHeader
        eyebrow="Courses"
        title="Onboarding lessons your newcomers can absorb"
        description="Build a tailored mini-curriculum from your knowledge base. AI drafts the outline and each lesson — you stay in full control."
        actions={
          <Button asChild variant="ai">
            <Link href="/mentor/courses/new">
              <Sparkles className="h-4 w-4" /> New course
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total courses"
          value={<CountUp value={counts.total} />}
          hint={`${counts.total_lessons} lessons across all courses`}
          icon={Layers}
        />
        <MetricCard
          label="Published"
          value={<CountUp value={counts.published} />}
          hint={
            counts.total
              ? `${Math.round((counts.published / counts.total) * 100)}% of catalog`
              : "—"
          }
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Pending review"
          value={<CountUp value={counts.pending_approval} />}
          hint={
            counts.pending_approval > 0
              ? "Needs your attention"
              : "All caught up"
          }
          icon={Clock}
          tone={counts.pending_approval > 0 ? "warning" : "default"}
          pulse={counts.pending_approval > 0}
        />
        <MetricCard
          label="AI-drafted"
          value={<CountUp value={aiPct} suffix="%" />}
          hint={`${counts.ai_drafted}/${counts.total || 0} courses`}
          icon={Sparkles}
          tone="ai"
        />
      </div>

      <AIPromptStrip />

      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-fg-faint)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses by title, summary, role…"
            className="pl-9"
            aria-label="Search courses"
          />
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      <LayoutGroup id="mentor-courses-status">
        <div className="flex flex-wrap items-center gap-1.5 -mt-2">
          <StatusSegment
            label="All"
            count={counts.total}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatusSegment
            label="Draft"
            count={counts.draft}
            active={statusFilter === "draft"}
            onClick={() => setStatusFilter("draft")}
          />
          <StatusSegment
            label="Pending"
            count={counts.pending_approval}
            active={statusFilter === "pending_approval"}
            onClick={() => setStatusFilter("pending_approval")}
          />
          <StatusSegment
            label="Approved"
            count={counts.approved}
            active={statusFilter === "approved"}
            onClick={() => setStatusFilter("approved")}
          />
          <StatusSegment
            label="Published"
            count={counts.published}
            active={statusFilter === "published"}
            onClick={() => setStatusFilter("published")}
          />
        </div>
      </LayoutGroup>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 rounded-[18px]" />
          <Skeleton className="h-44 rounded-[18px]" />
          <Skeleton className="h-44 rounded-[18px]" />
        </div>
      ) : !all.length ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Spin up a course in seconds — give the AI a prompt and a few sources, and it drafts an outline and every lesson."
          action={
            <Button asChild variant="ai">
              <Link href="/mentor/courses/new">
                <Plus className="h-4 w-4" /> New course
              </Link>
            </Button>
          }
        />
      ) : !filtered.length ? (
        <FilteredEmpty
          onClear={() => {
            setQuery("");
            setStatusFilter("all");
          }}
        />
      ) : (
        <CourseList courses={filtered} mode={view} />
      )}
    </div>
  );
}

function AIPromptStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="ai-border relative overflow-hidden rounded-[18px] bg-white p-4 sm:p-5"
    >
      <div className="absolute inset-0 ai-gradient-soft opacity-20" aria-hidden />
      <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ai-gradient text-white shadow-[var(--shadow-ai)]"
          aria-hidden
        >
          <Wand2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            Idea? Describe it.
          </div>
          <div className="text-sm font-medium text-[color:var(--color-fg)]">
            Sketch a course in one sentence — the AI drafts the outline and every lesson.
          </div>
        </div>
        <Button asChild variant="ai" size="sm">
          <Link href="/mentor/courses/new">
            Start drafting <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

function StatusSegment({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-transparent text-[color:var(--color-primary-active)]"
          : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)]",
      )}
      aria-pressed={active}
    >
      {active ? (
        <motion.span
          layoutId="status-seg-pill"
          className="ai-border absolute inset-0 rounded-full bg-white"
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        />
      ) : null}
      <span className="relative font-medium">{label}</span>
      <Badge
        tone={active ? "ai" : "neutral"}
        size="sm"
        className="relative !text-[10px]"
      >
        {count}
      </Badge>
    </motion.button>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-[color:var(--color-border)] bg-white p-0.5"
      role="group"
      aria-label="View mode"
    >
      <ViewButton
        active={view === "grid"}
        onClick={() => onChange("grid")}
        ariaLabel="Grid view"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </ViewButton>
      <ViewButton
        active={view === "compact"}
        onClick={() => onChange("compact")}
        ariaLabel="Compact list view"
      >
        <Rows3 className="h-3.5 w-3.5" />
      </ViewButton>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md transition-colors",
        active
          ? "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
          : "text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)]",
      )}
    >
      {children}
    </button>
  );
}

function FilteredEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[color:var(--color-border)] bg-white px-5 py-10 text-center">
      <Search className="mx-auto h-5 w-5 text-[color:var(--color-fg-faint)]" />
      <div className="mt-2 text-sm font-medium">No course matches your filters</div>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 text-xs font-medium text-[color:var(--color-primary)] hover:underline"
      >
        Clear filters
      </button>
    </div>
  );
}
