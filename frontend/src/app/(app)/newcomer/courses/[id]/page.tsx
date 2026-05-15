"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, BookOpen } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { getCourse } from "@/services/courses";

export default function NewcomerCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const course = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourse(id),
    enabled: Number.isFinite(id),
  });

  if (course.isLoading || !course.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <Link
          href="/newcomer/courses"
          className="inline-flex items-center gap-1 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
        >
          <ArrowLeft className="h-3 w-3" /> Back to courses
        </Link>
      </div>

      <PageHeader
        eyebrow="Course"
        title={course.data.title}
        description={course.data.summary ?? undefined}
        actions={
          course.data.generated_by_ai ? (
            <Badge tone="ai" size="lg">
              <Sparkles className="h-3 w-3" /> AI-drafted
            </Badge>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Table of contents
          </CardTitle>
          <CardDescription>
            {course.data.lessons.length} lesson{course.data.lessons.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1 list-decimal list-inside text-sm">
            {course.data.lessons.map((l) => (
              <li key={l.id}>
                <a href={`#lesson-${l.id}`} className="hover:underline">
                  {l.title}
                </a>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {course.data.lessons.map((l) => (
          <article key={l.id} id={`lesson-${l.id}`} className="rounded-2xl border border-[color:var(--color-border)] bg-white p-5 space-y-3">
            <header>
              <div className="flex items-center gap-2">
                <Badge tone="neutral" size="sm">#{l.index}</Badge>
                <h2 className="text-base font-semibold tracking-tight">{l.title}</h2>
              </div>
              {l.summary ? (
                <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{l.summary}</p>
              ) : null}
            </header>
            {l.infographic_source ? (
              <InfographicBlock source={l.infographic_source} kind={l.infographic_kind ?? "mermaid"} />
            ) : null}
            {l.body ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
                {l.body}
              </div>
            ) : (
              <p className="text-xs text-[color:var(--color-fg-muted)]">No body content yet — your mentor is still drafting this lesson.</p>
            )}
          </article>
        ))}
        {course.data.lessons.length === 0 ? (
          <div className="rounded-md border border-dashed border-[color:var(--color-border)] px-3 py-6 text-center text-xs text-[color:var(--color-fg-muted)]">
            This course has no lessons yet. Check back later.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfographicBlock({ source, kind }: { source: string; kind: string }) {
  if (kind === "mermaid") {
    const encoded = encodeURIComponent(source);
    // mermaid.ink serves a rendered SVG from a Mermaid source string.
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
        {/* Plain encoded version kept for accessibility */}
        <noscript>
          <code className="text-[11px]">{encoded.slice(0, 0)}</code>
        </noscript>
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
