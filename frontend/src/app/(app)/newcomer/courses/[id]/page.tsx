"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Circle,
  Menu,
  X,
  Trophy,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Markdown } from "@/components/shared/Markdown";
import { YouTubeEmbed, extractYouTubeId } from "@/components/shared/YouTubeEmbed";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Confetti } from "@/components/shared/Confetti";
import { ChapterScrubber } from "@/components/newcomer/lesson/ChapterScrubber";

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
  const [navOpen, setNavOpen] = React.useState(false);
  const [celebrate, setCelebrate] = React.useState(0);
  const prevAllDone = React.useRef(false);

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

  const lessons = course.data?.lessons ?? [];
  const totalCompleted = lessons.reduce(
    (acc, l) => acc + (completed.has(l.id) ? 1 : 0),
    0,
  );
  const allDone = lessons.length > 0 && totalCompleted === lessons.length;

  React.useEffect(() => {
    if (allDone && !prevAllDone.current) {
      setCelebrate((k) => k + 1);
    }
    prevAllDone.current = allDone;
  }, [allDone]);

  if (course.isLoading || !course.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  const selected =
    lessons.find((l) => l.id === selectedLessonId) ?? lessons[0] ?? null;

  const idx = selected ? lessons.findIndex((l) => l.id === selected.id) : -1;
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
  const progressPct = lessons.length ? Math.round((totalCompleted / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-4">
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

      <section className="relative overflow-hidden rounded-[20px] border border-[color:var(--color-border)] bg-white px-5 py-5 sm:px-7 sm:py-6">
        <AuroraBackground intensity="subtle" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
              Course
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{course.data.title}</h1>
            {course.data.summary ? (
              <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                {course.data.summary}
              </p>
            ) : null}
            {selected ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Badge tone="neutral" size="sm">
                  Lesson <span className="ai-gradient-text font-semibold">#{selected.index}</span>
                </Badge>
                <span className="text-[color:var(--color-fg-muted)]">
                  {displayLessonTitle(selected)}
                </span>
              </div>
            ) : null}
          </div>
          {lessons.length > 0 ? (
            <div className="flex items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-white/80 px-3 py-1.5 backdrop-blur">
              <ProgressRing value={progressPct} size={44} stroke={5} />
              <div className="text-xs">
                <div className="font-semibold tabular-nums">{progressPct}%</div>
                <div className="text-[10px] text-[color:var(--color-fg-muted)]">
                  {totalCompleted}/{lessons.length} lessons
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <ChapterScrubber
        lessons={lessons}
        selectedId={selected?.id ?? null}
        completed={completed}
        onSelect={(lid) => setSelectedLessonId(lid)}
      />

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block lg:sticky lg:top-16 lg:self-start">
          <LessonNav
            lessons={lessons}
            selectedId={selected?.id ?? null}
            completed={completed}
            onSelect={(lid) => setSelectedLessonId(lid)}
            onToggleComplete={toggleComplete}
          />
        </aside>

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
                      toggleComplete(selected.id);
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

      <AnimatePresence>
        {celebrate > 0 ? (
          <motion.div
            key={celebrate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm"
            onClick={() => setCelebrate(0)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="relative w-[min(440px,90vw)] overflow-hidden rounded-[20px] border border-[color:var(--color-border)] bg-white p-7 text-center shadow-[var(--shadow-elevated)]"
              onClick={(e) => e.stopPropagation()}
            >
              <AuroraBackground intensity="subtle" />
              <Confetti trigger={celebrate} />
              <div className="relative">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full ai-gradient text-white shadow-[var(--shadow-ai)]">
                  <Trophy className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight">
                  Course complete!
                </h2>
                <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                  You finished every lesson in{" "}
                  <span className="ai-gradient-text font-semibold">
                    {course.data.title}
                  </span>
                  . Time to put it to work.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/newcomer/courses">Back to courses</Link>
                  </Button>
                  <Button size="sm" onClick={() => setCelebrate(0)}>
                    Keep reviewing
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
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
  const selectedLesson = lessons.find((l) => l.id === selectedId);
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          <BookOpen className="h-3 w-3" /> Lessons · {lessons.length}
        </div>
        {selectedLesson ? (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)]/60 px-2 py-1.5">
            <Sparkles className="h-3 w-3 text-[color:var(--color-primary)]" />
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
                Now playing
              </div>
              <div className="truncate text-xs font-medium text-[color:var(--color-fg)]">
                {displayLessonTitle(selectedLesson)}
              </div>
            </div>
            <div
              className="flex items-end gap-0.5 text-[color:var(--color-primary)]"
              aria-hidden
            >
              <span className="audio-bar" />
              <span className="audio-bar" />
              <span className="audio-bar" />
            </div>
          </div>
        ) : null}
        <LayoutGroup id="lesson-nav">
          <ol className="space-y-1">
            {lessons.map((l, i) => {
              const isActive = selectedId === l.id;
              const isDone = completed.has(l.id);
              return (
                <li key={l.id}>
                  <div
                    className={cn(
                      "group relative flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors",
                      isActive
                        ? "bg-[color:var(--color-primary-soft)] border border-[color:var(--color-primary-ring)]"
                        : "border border-transparent hover:bg-[color:var(--color-surface-muted)]",
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="lesson-nav-rail"
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r ai-gradient"
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      />
                    ) : null}
                    <button
                      type="button"
                      aria-label={isDone ? "Mark as not done" : "Mark as done"}
                      onClick={() => onToggleComplete(l.id)}
                      className={cn(
                        "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full transition-transform",
                        isDone
                          ? "bg-[color:var(--color-success)] text-white animate-[pop-in_180ms_ease-out]"
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
        </LayoutGroup>
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

      {lesson.video_url && extractYouTubeId(lesson.video_url) ? (
        <div className="glow-ring rounded-xl">
          <div className="glass-card rounded-xl p-1.5">
            <YouTubeEmbed url={lesson.video_url} title={displayLessonTitle(lesson)} />
          </div>
        </div>
      ) : null}

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
