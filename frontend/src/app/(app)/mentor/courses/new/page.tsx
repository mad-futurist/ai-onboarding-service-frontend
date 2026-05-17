"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, BookOpen, ArrowLeft, FileText, Users, Wand2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SourcesPicker } from "@/components/mentor/plan-generator/SourcesPicker";
import { aiGenerateCourse, createCourse } from "@/services/courses";
import { listNewcomers } from "@/services/newcomers";
import { useDemo } from "@/providers/demo-provider";
import { toApiError } from "@/lib/api";
import type { ID } from "@/types";

export default function NewCoursePage() {
  return (
    <React.Suspense fallback={<SkeletonCourseBuilder />}>
      <NewCourseBuilder />
    </React.Suspense>
  );
}

function NewCourseBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mentorId } = useDemo();
  const [title, setTitle] = React.useState("");
  const [promptHint, setPromptHint] = React.useState(
    searchParams.get("prompt") ??
      "Backend onboarding for a new engineer joining the payments team. Focus on architecture, day-1 setup, and first PR.",
  );
  const [lessonCount, setLessonCount] = React.useState<number>(4);
  const initialNewcomerId = searchParams.get("newcomerId");
  const [newcomerId, setNewcomerId] = React.useState<string>(
    initialNewcomerId && /^\d+$/.test(initialNewcomerId) ? initialNewcomerId : "none",
  );
  const [roleTarget, setRoleTarget] = React.useState(searchParams.get("roleTarget") ?? "all");
  const [selectedDocs, setSelectedDocs] = React.useState<Set<ID>>(new Set());

  const { data: newcomers } = useQuery({
    queryKey: ["newcomers", mentorId],
    queryFn: () => listNewcomers(mentorId),
  });

  const aiMut = useMutation({
    mutationFn: () =>
      aiGenerateCourse({
        title: title.trim() || null,
        prompt_hint: promptHint.trim(),
        mentor_id: mentorId ?? undefined,
        newcomer_id: newcomerId === "none" ? null : Number(newcomerId),
        role_target: roleTarget.trim() || null,
        document_ids: Array.from(selectedDocs),
        lesson_count: lessonCount,
      }),
    onSuccess: (course) => {
      toast.success("Course drafted", {
        description: `${course.lessons?.length ?? 0} lessons generated — taking you to the editor.`,
      });
      router.push(`/mentor/courses/${course.id}`);
    },
    onError: (err) => toast.error("Generation failed", { description: toApiError(err).message }),
  });

  const blankMut = useMutation({
    mutationFn: () =>
      createCourse({
        title: title.trim() || "Untitled course",
        mentor_id: mentorId ?? undefined,
        newcomer_id: newcomerId === "none" ? null : Number(newcomerId),
        role_target: roleTarget.trim() || null,
        source_document_ids: Array.from(selectedDocs),
      }),
    onSuccess: (course) => {
      toast.success("Course created");
      router.push(`/mentor/courses/${course.id}`);
    },
    onError: (err) => toast.error("Create failed", { description: toApiError(err).message }),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-2 text-xs">
        <Link
          href="/mentor/courses"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
        </Link>
      </div>

      <PageHeader
        eyebrow="New course"
        title={
          <>
            Draft a course with <span className="ai-gradient-text">AI</span>
          </>
        }
        description="Outline the audience and intent, point at sources. AI generates an outline and writes every lesson in markdown."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Course basics
              </CardTitle>
              <CardDescription>Title is optional — AI proposes one if you leave it empty.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="Backend Onboarding: Payments"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-demo-id="course-title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prompt">What should the course teach?</Label>
                <Textarea
                  id="prompt"
                  rows={5}
                  value={promptHint}
                  onChange={(e) => setPromptHint(e.target.value)}
                  data-demo-id="course-prompt"
                />
                <p className="text-[11px] text-[color:var(--color-fg-subtle)]">
                  Be specific — the more concrete the better the outline.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Number of lessons</Label>
                  <Select
                    value={String(lessonCount)}
                    onValueChange={(v) => setLessonCount(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 8, 10].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3 w-3" /> For a specific newcomer
                    </span>
                  </Label>
                  <Select
                    value={newcomerId}
                    onValueChange={(value) => {
                      setNewcomerId(value);
                      const selected = newcomers?.find((n) => n.id === Number(value));
                      if (selected && (!roleTarget.trim() || roleTarget === "all")) {
                        setRoleTarget(normalizeRoleTarget(selected.job_title));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Generic (any newcomer)</SelectItem>
                      {newcomers?.map((n) => (
                        <SelectItem key={n.id} value={String(n.id)}>
                          {n.full_name ?? `Newcomer #${n.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="role-target">Assign to role</Label>
                  <Input
                    id="role-target"
                    placeholder="backend_developer"
                    value={roleTarget}
                    onChange={(e) => setRoleTarget(e.target.value)}
                    data-demo-id="course-role-target"
                  />
                  <p className="text-[11px] text-[color:var(--color-fg-subtle)]">
                    Role-matched courses appear in the newcomer&apos;s recommended list.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[color:var(--color-primary)]" /> Source documents
              </CardTitle>
              <CardDescription>
                AI grounds every lesson in the sources you pick. Selecting nothing is fine — the AI uses its general training.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SourcesPicker
                selected={selectedDocs}
                onToggle={(id) =>
                  setSelectedDocs((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                onSelectAll={(ids) => setSelectedDocs(new Set(ids))}
                maxHeight="max-h-[360px]"
              />
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
                Ready to generate?
              </h3>
              <p className="text-xs text-[color:var(--color-fg-muted)]">
                You can edit every lesson afterwards — manually or with the AI per-section.
              </p>
              <Button
                variant="ai"
                size="lg"
                className="w-full"
                disabled={aiMut.isPending || !promptHint.trim()}
                onClick={() => aiMut.mutate()}
                data-demo-id="course-generate-ai"
              >
                {aiMut.isPending ? (
                  <Wand2 className="h-4 w-4 animate-pulse" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {aiMut.isPending ? "Drafting course…" : "Generate with AI"}
              </Button>
              <div className="text-center text-[11px] text-[color:var(--color-fg-subtle)]">
                or
              </div>
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => blankMut.mutate()}
                disabled={blankMut.isPending}
              >
                {blankMut.isPending ? "Creating…" : "Start a blank course"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function normalizeRoleTarget(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function SkeletonCourseBuilder() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <div className="h-8 w-32 rounded-md bg-[color:var(--color-surface-muted)]" />
      <div className="h-24 rounded-xl bg-[color:var(--color-surface-muted)]" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="h-96 rounded-xl bg-[color:var(--color-surface-muted)]" />
        <div className="h-48 rounded-xl bg-[color:var(--color-surface-muted)]" />
      </div>
    </div>
  );
}
