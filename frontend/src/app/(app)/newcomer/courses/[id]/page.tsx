"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Circle,
  Menu,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Markdown } from "@/components/shared/Markdown";

import { getCourse } from "@/services/courses";
import { useDemo } from "@/providers/demo-provider";
import type { Lesson, ID } from "@/types";

const PROGRESS_KEY = (courseId: ID) => `newcomer.course.${courseId}.completed`;

export default function NewcomerCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const { newcomerId } = useDemo();
  const id = Number(params?.id);

  const course = useQuery({
    queryKey: ["course", id, newcomerId],
    queryFn: () => getCourse(id, { newcomer_id: newcomerId ?? undefined }),
    enabled: Number.isFinite(id) && !!newcomerId,
  });

  const [selectedLessonId, setSelectedLessonId] = React.useState<ID | null>(null);
  const [defaultApplied, setDefaultApplied] = React.useState(false);
  const [completed, setCompleted] = React.useState<Set<ID>>(new Set());
  const [progressLoaded, setProgressLoaded] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false); // mobile drawer

  // Load completion state from localStorage once we know the course id
  if (!progressLoaded && Number.isFinite(id)) {
    setProgressLoaded(true);
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(PROGRESS_KEY(id)) : null;
      if (raw) {
        const ids: ID[] = JSON.parse(raw);
        setCompleted(new Set(ids));
      }
    } catch {
      // ignore corrupt storage
    }
  }

  // Default to the first lesson once course loads
  if (!defaultApplied && course.data?.lessons?.length && selectedLessonId == null) {
    setDefaultApplied(true);
    setSelectedLessonId(course.data.lessons[0].id);
  }

  const persistCompleted = (next: Set<ID>) => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PROGRESS_KEY(id), JSON.stringify(Array.from(next)));
      }
    } catch {
      // ignore
    }
  };

  const toggleComplete = (lessonId: ID) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      persistCompleted(next);
      return next;
    });
  };

  if (course.isLoading || !course.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  const lessons = course.data.lessons ?? [];
  const selected =
    lessons.find((l) => l.id === selectedLessonId) ?? lessons[0] ?? null;

  const idx = selected ? lessons.findIndex((l) => l.id === selected.id) : -1;
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
  const totalCompleted = lessons.reduce(
    (acc, l) => acc + (completed.has(l.id) ? 1 : 0),
    0,
  );
  const progressPct = lessons.length ? Math.round((totalCompleted / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/newcomer/courses"
          className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
        </Link>
        <div className="flex items-center gap-2">
          {course.data.generated_by_ai ? (
            <Badge tone="ai" size="sm">
              <Sparkles className="h-2.5 w-2.5" /> AI-drafted
            </Badge>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="h-3.5 w-3.5" /> Lessons
          </Button>
        </div>
      </div>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{course.data.title}</h1>
        {course.data.summary ? (
          <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{course.data.summary}</p>
        ) : null}
        {lessons.length > 0 ? (
          <div className="mt-3 flex items-center gap-3 text-xs">
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between text-[11px] text-[color:var(--color-fg-subtle)]">
                <span>Progress</span>
                <span className="font-medium text-[color:var(--color-fg)]">
                  {totalCompleted}/{lessons.length} · {progressPct}%
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-[color:var(--color-surface-muted)]">
                <div
                  className="h-full rounded-full ai-gradient transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Lesson nav (desktop) */}
        <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start">
          <LessonNav
            lessons={lessons}
            selectedId={selected?.id ?? null}
            completed={completed}
            onSelect={(lid) => setSelectedLessonId(lid)}
            onToggleComplete={toggleComplete}
          />
        </aside>

        {/* Lesson nav (mobile drawer) */}
        {navOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setNavOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Lessons</div>
                <button
                  onClick={() => setNavOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-md hover:bg-[color:var(--color-surface-muted)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <LessonNav
                lessons={lessons}
                selectedId={selected?.id ?? null}
                completed={completed}
                onSelect={(lid) => {
                  setSelectedLessonId(lid);
                  setNavOpen(false);
                }}
                onToggleComplete={toggleComplete}
              />
            </div>
          </div>
        ) : null}

        {/* Lesson content */}
        <main className="min-w-0 space-y-4">
          {selected ? (
            <>
              <LessonView
                key={selected.id}
                lesson={selected}
                isCompleted={completed.has(selected.id)}
                onToggleComplete={() => toggleComplete(selected.id)}
              />
              <nav className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-white p-3">
                {prev ? (
                  <button
                    onClick={() => setSelectedLessonId(prev.id)}
                    className="flex items-start gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-[color:var(--color-surface-muted)]"
                  >
                    <ArrowLeft className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--color-fg-subtle)]" />
                    <span>
                      <span className="block text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                        Previous
                      </span>
                      <span className="text-sm font-medium text-[color:var(--color-fg)]">{displayLessonTitle(prev)}</span>
                    </span>
                  </button>
                ) : (
                  <span />
                )}
                {next ? (
                  <button
                    onClick={() => {
                      toggleComplete(selected.id); // mark current done when moving forward
                      setSelectedLessonId(next.id);
                    }}
                    className="flex items-start gap-2 rounded-md px-2 py-1 text-right text-xs hover:bg-[color:var(--color-primary-soft)] ml-auto"
                  >
                    <span>
                      <span className="block text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                        Next
                      </span>
                      <span className="text-sm font-medium text-[color:var(--color-fg)]">{displayLessonTitle(next)}</span>
                    </span>
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--color-primary)]" />
                  </button>
                ) : (
                  <span className="text-xs text-[color:var(--color-fg-muted)]">
                    🎉 You&apos;ve reached the end.
                  </span>
                )}
              </nav>
            </>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No lessons yet"
              description="Your mentor is still drafting this course. Check back later."
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LessonNav({
  lessons,
  selectedId,
  completed,
  onSelect,
  onToggleComplete,
}: {
  lessons: Lesson[];
  selectedId: ID | null;
  completed: Set<ID>;
  onSelect: (id: ID) => void;
  onToggleComplete: (id: ID) => void;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          <BookOpen className="h-3 w-3" /> Lessons · {lessons.length}
        </div>
        <ol className="space-y-1">
          {lessons.map((l, i) => {
            const isActive = selectedId === l.id;
            const isDone = completed.has(l.id);
            return (
              <li key={l.id}>
                <div
                  className={cn(
                    "group flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors",
                    isActive
                      ? "bg-[color:var(--color-primary-soft)] border border-[color:var(--color-primary-ring)]"
                      : "border border-transparent hover:bg-[color:var(--color-surface-muted)]",
                  )}
                >
                  <button
                    type="button"
                    aria-label={isDone ? "Mark as not done" : "Mark as done"}
                    onClick={() => onToggleComplete(l.id)}
                    className={cn(
                      "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full",
                      isDone
                        ? "bg-[color:var(--color-success)] text-white"
                        : "border border-[color:var(--color-border-strong)] text-transparent hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]",
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect(l.id)}
                    className="flex flex-1 min-w-0 items-start gap-2 text-left"
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-semibold",
                        isActive
                          ? "bg-[color:var(--color-primary)] text-white"
                          : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 truncate text-sm",
                        isActive
                          ? "font-medium text-[color:var(--color-primary-active)]"
                          : "text-[color:var(--color-fg)]",
                        isDone && !isActive && "text-[color:var(--color-fg-muted)] line-through",
                      )}
                    >
                      {displayLessonTitle(l)}
                    </span>
                  </button>
                </div>
              </li>
            );
          })}
          {lessons.length === 0 ? (
            <li className="rounded-lg border border-dashed border-[color:var(--color-border)] px-2 py-3 text-center text-xs text-[color:var(--color-fg-muted)]">
              No lessons yet.
            </li>
          ) : null}
        </ol>
      </CardContent>
    </Card>
  );
}

function LessonView({
  lesson,
  isCompleted,
  onToggleComplete,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  onToggleComplete: () => void;
}) {
  const summary = displayLessonSummary(lesson);
  const body = displayLessonBody(lesson);

  return (
    <article className="rounded-2xl border border-[color:var(--color-border)] bg-white p-6 space-y-4">
      <header className="space-y-1.5 border-b border-[color:var(--color-border)] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" size="sm">
            Lesson #{lesson.index}
          </Badge>
          {isCompleted ? (
            <Badge tone="success" size="sm">
              <CheckCircle2 className="h-2.5 w-2.5" /> Done
            </Badge>
          ) : null}
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{displayLessonTitle(lesson)}</h2>
        {summary ? (
          <p className="text-sm text-[color:var(--color-fg-muted)]">{summary}</p>
        ) : null}
      </header>

      {lesson.infographic_source ? (
        <InfographicBlock source={lesson.infographic_source} kind={lesson.infographic_kind ?? "mermaid"} />
      ) : null}

      {body ? (
        <Markdown>{body}</Markdown>
      ) : (
        <p className="text-xs text-[color:var(--color-fg-muted)]">
          No body content yet — your mentor is still drafting this lesson.
        </p>
      )}

      <div className="flex justify-end border-t border-[color:var(--color-border)] pt-3">
        <Button variant={isCompleted ? "outline" : "default"} size="sm" onClick={onToggleComplete}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isCompleted ? "Mark as not done" : "Mark as done"}
        </Button>
      </div>
    </article>
  );
}

function isPlaceholderLessonText(value?: string | null) {
  const text = (value ?? "").toLowerCase();
  return text.includes("outline placeholder") || text.includes("add details with the mentor");
}

function displayLessonTitle(lesson: Lesson) {
  const title = lesson.title?.trim();
  if (!title || /^lesson\s+\d+$/i.test(title)) {
    return `Lesson ${lesson.index}`;
  }
  return title;
}

function displayLessonSummary(lesson: Lesson) {
  if (!lesson.summary || isPlaceholderLessonText(lesson.summary)) return null;
  return lesson.summary;
}

function displayLessonBody(lesson: Lesson) {
  if (!lesson.body || isPlaceholderLessonText(lesson.body)) return null;
  return lesson.body;
}

function InfographicBlock({ source, kind }: { source: string; kind: string }) {
  if (kind === "mermaid") {
    const url = `https://mermaid.ink/svg/${btoaSafe(source)}`;
    return (
      <figure className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 p-3">
        <picture>
          <img
            src={url}
            alt="Course infographic"
            className="mx-auto max-h-[420px] w-auto"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </picture>
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] text-[color:var(--color-fg-muted)]">
            View Mermaid source
          </summary>
          <pre className="mt-1 overflow-x-auto rounded bg-[color:var(--color-surface-muted)] p-2 text-[11px]">
            <code>{source}</code>
          </pre>
        </details>
      </figure>
    );
  }
  return (
    <figure className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 p-3">
      <pre className="overflow-x-auto text-xs">
        <code>{source}</code>
      </pre>
    </figure>
  );
}

function btoaSafe(s: string): string {
  if (typeof window === "undefined") return "";
  try {
    return window.btoa(unescape(encodeURIComponent(s)));
  } catch {
    return "";
  }
}
