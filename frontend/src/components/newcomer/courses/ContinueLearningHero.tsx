"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, GraduationCap } from "lucide-react";

import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeProgress } from "@/lib/course-progress";
import type { Course } from "@/types";

interface ContinueLearningHeroProps {
  /** The course to resume — usually the last-viewed non-complete course. */
  resumeCourse?: Course | null;
  /** How many lessons the user has already completed in resumeCourse. */
  completedCount?: number;
  /** Total assigned + accessible courses (used in the empty-state copy). */
  availableCount?: number;
  /** Total lessons completed across all courses (mini stat). */
  totalLessonsCompleted?: number;
}

export function ContinueLearningHero({
  resumeCourse,
  completedCount = 0,
  availableCount = 0,
  totalLessonsCompleted = 0,
}: ContinueLearningHeroProps) {
  const hasResume = !!resumeCourse;
  const progress = hasResume
    ? computeProgress(completedCount, resumeCourse?.lessons_count ?? null)
    : { pct: 0, done: 0, total: 0, complete: false };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-[color:var(--color-border)] bg-white px-6 py-7 sm:px-8 sm:py-8",
        "shadow-[var(--shadow-card)]",
      )}
    >
      <AuroraBackground intensity="hero" />
      <div className="bg-grid-faint absolute inset-0 opacity-30" aria-hidden />

      <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)] backdrop-blur">
            <Sparkles className="h-3 w-3" />
            {hasResume ? "Continue learning" : "Your learning workspace"}
          </div>

          {hasResume ? (
            <>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Pick up where you left off
              </h1>
              <p className="mt-1 line-clamp-1 text-sm text-[color:var(--color-fg-muted)]">
                <span className="font-medium text-[color:var(--color-fg)]">
                  {resumeCourse!.title}
                </span>{" "}
                — {progress.done} of {progress.total || "?"} lessons done.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button asChild variant="ai" size="sm">
                  <Link href={`/newcomer/courses/${resumeCourse!.id}`}>
                    <Play className="h-3.5 w-3.5" /> Resume course
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="#library">
                    Browse all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                {resumeCourse!.role_target ? (
                  <Badge tone="neutral" size="sm">
                    {resumeCourse!.role_target.replace(/_/g, " ")}
                  </Badge>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Learn at your own pace
              </h1>
              <p className="mt-1 max-w-xl text-sm text-[color:var(--color-fg-muted)]">
                {availableCount > 0
                  ? `You have ${availableCount} course${availableCount > 1 ? "s" : ""} available. Pick one to start — your progress is saved automatically.`
                  : "Your mentor hasn't assigned a course yet. Explore the library below to get a head start."}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button asChild variant="ai" size="sm">
                  <Link href="#library">
                    <GraduationCap className="h-3.5 w-3.5" /> Browse courses
                  </Link>
                </Button>
                {totalLessonsCompleted > 0 ? (
                  <span className="text-xs text-[color:var(--color-fg-muted)]">
                    {totalLessonsCompleted} lessons completed so far
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>

        {hasResume ? (
          <div className="flex flex-col items-center gap-2">
            <div className="ai-border relative rounded-full bg-white p-2">
              <ProgressRing value={progress.pct} size={96} stroke={8} tone="ai" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-xl font-semibold tabular-nums leading-none">
                    {progress.pct}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                    course
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[color:var(--color-fg-muted)]">
              Lesson {Math.min(progress.done + 1, progress.total || 1)} of{" "}
              {progress.total || "?"}
            </div>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
