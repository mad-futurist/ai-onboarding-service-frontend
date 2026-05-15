"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, ChevronRight, Sparkles, Check } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

import { listCourses } from "@/services/courses";
import { useDemo } from "@/providers/demo-provider";

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

  const mine = (personal.data ?? []).filter((c) =>
    c.status === "approved" || c.status === "published",
  );
  const others = (published.data ?? []).filter((c) => !mine.find((m) => m.id === c.id));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Courses"
        title="Learn at your own pace"
        description="Short, mentor-approved courses based on your team's documentation. Open one to read lessons and view infographics."
      />

      <section>
        <h2 className="mb-2 text-sm font-semibold tracking-tight">Recommended for you</h2>
        {personal.isLoading ? (
          <Skeleton className="h-32" />
        ) : mine.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No course assigned yet"
            description="Your mentor will assign courses tailored to your role. Browse the published library below in the meantime."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {mine.map((c) => (
              <li key={c.id}>
                <CourseCard course={c} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {others.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold tracking-tight">Published library</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {others.map((c) => (
              <li key={c.id}>
                <CourseCard course={c} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CourseCard({
  course,
}: {
  course: {
    id: number;
    title: string;
    summary: string | null;
    status: string;
    generated_by_ai: boolean;
    role_target?: string | null;
  };
}) {
  return (
    <Link
      href={`/newcomer/courses/${course.id}`}
      className="surface-card group flex items-start gap-3 p-4 hover:border-[color:var(--color-primary-ring)] transition-colors"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
        <GraduationCap className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-medium tracking-tight group-hover:underline truncate">{course.title}</h4>
        {course.summary ? (
          <p className="text-xs text-[color:var(--color-fg-muted)] line-clamp-2 mt-0.5">{course.summary}</p>
        ) : null}
        <div className="mt-1.5 flex items-center gap-1.5">
          {course.status === "published" ? (
            <Badge tone="success" size="sm">
              <Check className="h-2.5 w-2.5" /> Published
            </Badge>
          ) : (
            <Badge tone="brand" size="sm">{course.status.replace(/_/g, " ")}</Badge>
          )}
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
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-fg-faint)]" />
    </Link>
  );
}
