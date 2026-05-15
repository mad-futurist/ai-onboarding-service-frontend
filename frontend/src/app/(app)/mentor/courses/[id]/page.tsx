"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  Upload,
  XCircle,
  Loader2,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LessonTree } from "@/components/mentor/courses/LessonTree";
import { LessonEditor } from "@/components/mentor/courses/LessonEditor";

import {
  aiGenerateLesson,
  approveCourse,
  createLesson,
  deleteLesson,
  getCourse,
  publishCourse,
  rejectCourse,
  submitCourseForApproval,
  updateLesson,
} from "@/services/courses";
import { toApiError } from "@/lib/api";
import type { ID } from "@/types";

export default function CourseEditorPage() {
  const params = useParams<{ id: string }>();
  const courseId = Number(params.id);
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
    enabled: Number.isFinite(courseId),
  });

  const [selectedLessonId, setSelectedLessonId] = React.useState<ID | null>(null);
  const [defaultApplied, setDefaultApplied] = React.useState(false);
  if (!defaultApplied && selectedLessonId == null && course?.lessons?.length) {
    setDefaultApplied(true);
    setSelectedLessonId(course.lessons[0].id);
  }

  const reorderMut = useMutation({
    mutationFn: async (orderedIds: ID[]) => {
      await Promise.all(
        orderedIds.map((id, i) => updateLesson(id, { index: i + 1 })),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course", courseId] }),
    onError: (err) => toast.error("Reorder failed", { description: toApiError(err).message }),
  });

  const manualMut = useMutation({
    mutationFn: (title: string) =>
      createLesson(courseId, {
        title,
        index: (course?.lessons?.length ?? 0) + 1,
      }),
    onSuccess: (lesson) => {
      toast.success("Lesson added");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
      setSelectedLessonId(lesson.id);
    },
    onError: (err) => toast.error("Create failed", { description: toApiError(err).message }),
  });

  const aiMut = useMutation({
    mutationFn: ({ title, summary }: { title: string; summary: string }) =>
      aiGenerateLesson(courseId, title, summary),
    onSuccess: (lesson) => {
      toast.success("AI lesson added");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
      setSelectedLessonId(lesson.id);
    },
    onError: (err) => toast.error("AI failed", { description: toApiError(err).message }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: ID) => deleteLesson(id),
    onSuccess: (_, id) => {
      toast.success("Lesson deleted");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
      if (selectedLessonId === id) {
        const remaining = (course?.lessons ?? []).filter((l) => l.id !== id);
        setSelectedLessonId(remaining[0]?.id ?? null);
      }
    },
    onError: (err) => toast.error("Delete failed", { description: toApiError(err).message }),
  });

  const submitMut = useMutation({
    mutationFn: () => submitCourseForApproval(courseId),
    onSuccess: () => {
      toast.success("Submitted for approval");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (err) => toast.error("Submit failed", { description: toApiError(err).message }),
  });
  const approveMut = useMutation({
    mutationFn: () => approveCourse(courseId),
    onSuccess: () => {
      toast.success("Course approved");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (err) => toast.error("Approve failed", { description: toApiError(err).message }),
  });
  const publishMut = useMutation({
    mutationFn: () => publishCourse(courseId),
    onSuccess: () => {
      toast.success("Course published");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (err) => toast.error("Publish failed", { description: toApiError(err).message }),
  });
  const rejectMut = useMutation({
    mutationFn: () => rejectCourse(courseId),
    onSuccess: () => {
      toast.success("Course rejected");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (err) => toast.error("Reject failed", { description: toApiError(err).message }),
  });

  if (isLoading || !course) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const selected = course.lessons?.find((l) => l.id === selectedLessonId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-4">
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/85 px-4 sm:px-6 py-2.5 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/mentor/courses"
              className="grid h-7 w-7 place-items-center rounded-md text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]"
              aria-label="Back to courses"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/mentor/courses"
              className="rounded px-1.5 py-0.5 text-xs text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]"
            >
              Courses
            </Link>
            <span className="text-[color:var(--color-fg-faint)]">/</span>
            <span className="rounded px-1.5 py-0.5 text-xs font-medium text-[color:var(--color-fg)] truncate max-w-md">
              {course.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {course.status === "draft" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => submitMut.mutate()}
                disabled={submitMut.isPending}
              >
                <Send className="h-3.5 w-3.5" /> Submit for review
              </Button>
            ) : null}
            {course.status === "pending_approval" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rejectMut.mutate()}
                  disabled={rejectMut.isPending}
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => approveMut.mutate()}
                  disabled={approveMut.isPending}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </Button>
              </>
            ) : null}
            {course.status === "approved" ? (
              <Button
                size="sm"
                variant="ai"
                onClick={() => publishMut.mutate()}
                disabled={publishMut.isPending}
              >
                {publishMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}{" "}
                Publish
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <Card className="lg:w-80 shrink-0">
          <CardContent className="p-3">
            <LessonTree
              course={course}
              selectedLessonId={selectedLessonId}
              onSelect={setSelectedLessonId}
              onReorder={(ids) => reorderMut.mutate(ids)}
              onCreateManual={(title) => manualMut.mutate(title)}
              onCreateAI={(title, summary) => aiMut.mutate({ title, summary })}
              onDelete={(id) => deleteMut.mutate(id)}
              creating={manualMut.isPending}
              aiCreating={aiMut.isPending}
            />
          </CardContent>
        </Card>

        <div className="flex-1 min-w-0">
          {selected ? (
            <LessonEditor key={selected.id} courseId={courseId} lesson={selected} />
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="Pick a lesson — or add one"
              description="Drafted lessons appear on the left. Reorder by dragging, click to edit, or add a new one manually or with AI."
            />
          )}
        </div>
      </div>
    </div>
  );
}
