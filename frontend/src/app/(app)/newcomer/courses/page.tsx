"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  GraduationCap,
  Search,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Flame,
  Library,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { MetricCard } from "@/components/shared/MetricCard";
import { CountUp } from "@/components/shared/CountUp";
import { ContinueLearningHero } from "@/components/newcomer/courses/ContinueLearningHero";
import { CourseProgressCard } from "@/components/newcomer/courses/CourseProgressCard";

import { listCourses } from "@/services/courses";
import { useDemo } from "@/providers/demo-provider";
import {
  readAllCourseProgress,
  readLastViewedCourseId,
  computeProgress,
} from "@/lib/course-progress";
import type { Course, ID } from "@/types";

export default function NewcomerCoursesPage() {
  const { newcomerId } = useDemo();

  const personal = useQuery({
    queryKey: ["courses-for-newcomer", newcomerId],
    queryFn: () =>
      listCourses({
        newcomer_id: newcomerId ?? undefined,
        include_role_matches: true,
      }),
    enabled: !!newcomerId,
  });
  const published = useQuery({
    queryKey: ["courses-published"],
    queryFn: () => listCourses({ status: "published", public_only: true }),
  });

  const mine = React.useMemo(
    () =>
      (personal.data ?? []).filter(
        (c) => c.status === "approved" || c.status === "published",
      ),
    [personal.data],
  );
  const others = React.useMemo(
    () =>
      (published.data ?? []).filter(
        (c) => !mine.find((m) => m.id === c.id),
      ),
    [published.data, mine],
  );

  // ─── Per-course progress (localStorage) ───────────────────────────────────
  const [progressMap, setProgressMap] = React.useState<Map<ID, number>>(
    () => new Map(),
  );
  const [lastViewedId, setLastViewedId] = React.useState<ID | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  if (!hydrated) {
    setHydrated(true);
    if (typeof window !== "undefined") {
      const entries = readAllCourseProgress();
      const map = new Map<ID, number>();
      for (const e of entries) {
        map.set(e.courseId, e.completedLessonIds.length);
      }
      setProgressMap(map);
      setLastViewedId(readLastViewedCourseId());
    }
  }

  // ─── Search + role-target filter ──────────────────────────────────────────
  const [query, setQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);

  const allRoles = React.useMemo(() => {
    const set = new Set<string>();
    for (const c of [...mine, ...others]) {
      if (c.role_target) set.add(c.role_target);
    }
    return Array.from(set).sort();
  }, [mine, others]);

  const matches = React.useCallback(
    (c: Course) => {
      if (selectedRole && c.role_target !== selectedRole) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        (c.summary?.toLowerCase().includes(q) ?? false)
      );
    },
    [query, selectedRole],
  );

  const mineFiltered = mine.filter(matches);
  const othersFiltered = others.filter(matches);

  // ─── Hero resume target ───────────────────────────────────────────────────
  const allVisibleCourses = React.useMemo(
    () => [...mine, ...others],
    [mine, others],
  );

  const resumeCourse = React.useMemo<Course | null>(() => {
    if (!allVisibleCourses.length) return null;

    const findById = (id: ID | null) =>
      id != null ? allVisibleCourses.find((c) => c.id === id) ?? null : null;

    const isInProgress = (c: Course) => {
      const done = progressMap.get(c.id) ?? 0;
      const total = c.lessons_count ?? 0;
      if (done <= 0) return false;
      return total === 0 || done < total;
    };

    const lastViewed = findById(lastViewedId);
    if (lastViewed && isInProgress(lastViewed)) return lastViewed;

    const inProgress = allVisibleCourses.filter(isInProgress);
    if (inProgress.length > 0) return inProgress[0];
    return null;
  }, [allVisibleCourses, progressMap, lastViewedId]);

  const totalLessonsCompleted = React.useMemo(
    () => Array.from(progressMap.values()).reduce((a, b) => a + b, 0),
    [progressMap],
  );

  const completedCoursesCount = React.useMemo(
    () =>
      allVisibleCourses.filter((c) => {
        const done = progressMap.get(c.id) ?? 0;
        return computeProgress(done, c.lessons_count ?? 0).complete;
      }).length,
    [allVisibleCourses, progressMap],
  );

  const loading = personal.isLoading || published.isLoading;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {loading && !allVisibleCourses.length ? (
        <Skeleton className="h-56 rounded-[24px]" />
      ) : (
        <ContinueLearningHero
          resumeCourse={resumeCourse}
          completedCount={
            resumeCourse ? progressMap.get(resumeCourse.id) ?? 0 : 0
          }
          availableCount={allVisibleCourses.length}
          totalLessonsCompleted={totalLessonsCompleted}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Available"
          value={<CountUp value={allVisibleCourses.length} />}
          hint="Recommended + published library"
          icon={Library}
          tone="default"
        />
        <MetricCard
          label="Completed"
          value={<CountUp value={completedCoursesCount} />}
          hint={completedCoursesCount > 0 ? "Nice momentum." : "First one is a click away."}
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Lessons read"
          value={<CountUp value={totalLessonsCompleted} />}
          hint={totalLessonsCompleted >= 5 ? "On a roll." : "Keep going."}
          icon={Flame}
          tone="ai"
        />
      </div>

      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-fg-faint)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses by title or summary…"
            className="pl-9"
            aria-label="Search courses"
          />
        </div>
        {allRoles.length > 0 ? (
          <LayoutGroup id="newcomer-courses-role-chips">
            <div className="flex flex-wrap items-center gap-1.5">
              <RoleChip
                label="All roles"
                active={selectedRole === null}
                onClick={() => setSelectedRole(null)}
              />
              {allRoles.map((role) => (
                <RoleChip
                  key={role}
                  label={role.replace(/_/g, " ")}
                  active={selectedRole === role}
                  onClick={() =>
                    setSelectedRole((prev) => (prev === role ? null : role))
                  }
                />
              ))}
            </div>
          </LayoutGroup>
        ) : null}
      </div>

      <CoursesSection
        title="Recommended for you"
        eyebrow="Assigned"
        icon={Sparkles}
        count={mineFiltered.length}
        loading={loading && mine.length === 0}
        empty={
          mine.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No course assigned yet"
              description="Your mentor will assign courses tailored to your role. Browse the published library below in the meantime."
            />
          ) : null
        }
        emptyFiltered={
          mine.length > 0 && mineFiltered.length === 0 ? (
            <FilteredEmpty onClear={() => { setQuery(""); setSelectedRole(null); }} />
          ) : null
        }
        cards={mineFiltered.map((c) => (
          <CourseProgressCard
            key={c.id}
            course={c}
            completedCount={progressMap.get(c.id) ?? 0}
            highlighted
          />
        ))}
      />

      {others.length > 0 ? (
        <div id="library">
          <CoursesSection
            title="Published library"
            eyebrow="Explore"
            icon={BookOpen}
            count={othersFiltered.length}
            loading={false}
            empty={null}
            emptyFiltered={
              othersFiltered.length === 0 ? (
                <FilteredEmpty
                  onClear={() => {
                    setQuery("");
                    setSelectedRole(null);
                  }}
                />
              ) : null
            }
            cards={othersFiltered.map((c) => (
              <CourseProgressCard
                key={c.id}
                course={c}
                completedCount={progressMap.get(c.id) ?? 0}
              />
            ))}
          />
        </div>
      ) : null}
    </div>
  );
}

function CoursesSection({
  title,
  eyebrow,
  icon: Icon,
  count,
  loading,
  empty,
  emptyFiltered,
  cards,
}: {
  title: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  loading: boolean;
  empty: React.ReactNode | null;
  emptyFiltered: React.ReactNode | null;
  cards: React.ReactNode[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            <Icon className="h-3 w-3" /> {eyebrow}
          </div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        </div>
        {count > 0 ? (
          <Badge tone="neutral" size="sm">
            {count} {count === 1 ? "course" : "courses"}
          </Badge>
        ) : null}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 rounded-[18px]" />
          <Skeleton className="h-44 rounded-[18px]" />
          <Skeleton className="h-44 rounded-[18px]" />
        </div>
      ) : empty ? (
        empty
      ) : emptyFiltered ? (
        emptyFiltered
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.ul
            layout
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {cards.map((card, i) => (
              <motion.li
                layout
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {card}
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      )}
    </section>
  );
}

function RoleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={`relative inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-transparent text-[color:var(--color-primary-active)]"
          : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)]"
      }`}
      aria-pressed={active}
    >
      {active ? (
        <motion.span
          layoutId="role-chip-bg"
          className="ai-border absolute inset-0 rounded-full bg-white"
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        />
      ) : null}
      <span className="relative">{label}</span>
    </motion.button>
  );
}

function FilteredEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[color:var(--color-border)] bg-white px-5 py-8 text-center">
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
