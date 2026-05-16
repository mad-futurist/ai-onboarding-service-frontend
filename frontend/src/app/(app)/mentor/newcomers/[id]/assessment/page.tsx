"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  getActiveAssessmentForNewcomer,
  getAssessmentSubmission,
} from "@/services/assessments";
import { getNewcomer } from "@/services/newcomers";
import { cn } from "@/lib/utils";
import type { ID } from "@/types";

export default function MentorNewcomerAssessmentPage() {
  const params = useParams<{ id: string }>();
  const newcomerId = Number(params.id) as ID;

  const { data: newcomer } = useQuery({
    queryKey: ["newcomer", newcomerId],
    queryFn: () => getNewcomer(newcomerId),
    enabled: !!newcomerId,
  });

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["newcomer-assessment", newcomerId],
    queryFn: () => getActiveAssessmentForNewcomer(newcomerId),
    enabled: !!newcomerId,
  });

  const { data: submission } = useQuery({
    queryKey: ["newcomer-assessment-submission", assessment?.id],
    queryFn: () => getAssessmentSubmission(assessment!.id),
    enabled: !!assessment,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 text-center space-y-4">
        <h1 className="text-xl font-semibold">No skill check for this newcomer.</h1>
        <Button asChild variant="ghost">
          <Link href={`/mentor/newcomers/${newcomerId}`}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>
    );
  }

  const answersById = new Map(
    (submission?.answers ?? []).map((a) => [a.question_id, a]),
  );

  const skillStats: Record<string, { sum: number; count: number }> = {};
  (submission?.answers ?? []).forEach((a) => {
    const q = assessment.questions.find((qq) => qq.id === a.question_id);
    const tag = q?.skill_tag ?? "general";
    const s = a.mentor_score ?? a.ai_score ?? 0;
    skillStats[tag] = skillStats[tag] ?? { sum: 0, count: 0 };
    skillStats[tag].sum += s;
    skillStats[tag].count += 1;
  });
  const skillRows = Object.entries(skillStats)
    .map(([tag, { sum, count }]) => ({ tag, avg: count ? sum / count : 0 }))
    .sort((a, b) => a.avg - b.avg);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Skill check"
        title={newcomer?.full_name ?? `Newcomer #${newcomerId}`}
        description={
          submission?.submitted_at
            ? `Submitted ${new Date(submission.submitted_at).toLocaleString()}`
            : "Assessment is still pending submission."
        }
        actions={
          <Button asChild variant="ghost">
            <Link href={`/mentor/newcomers/${newcomerId}`}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />

      {submission ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" />
              AI summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-semibold tabular-nums">
                {submission.overall_score != null
                  ? Math.round(submission.overall_score * 100) + "%"
                  : "—"}
              </span>
              <span className="text-xs text-[color:var(--color-fg-muted)]">
                Overall score
              </span>
            </div>
            {submission.summary ? (
              <p className="text-sm text-[color:var(--color-fg-muted)]">
                {submission.summary}
              </p>
            ) : null}
            {skillRows.length ? (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-muted)]">
                  Per-skill performance
                </h4>
                <ul className="space-y-1.5">
                  {skillRows.map((r) => (
                    <li key={r.tag} className="flex items-center gap-3 text-sm">
                      <span className="w-32 truncate text-[color:var(--color-fg)]">
                        #{r.tag}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-[color:var(--color-surface-muted)] overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            r.avg >= 0.7
                              ? "bg-emerald-500"
                              : r.avg >= 0.4
                                ? "bg-amber-500"
                                : "bg-rose-500",
                          )}
                          style={{ width: `${Math.round(r.avg * 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs tabular-nums text-[color:var(--color-fg-muted)]">
                        {Math.round(r.avg * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-[color:var(--color-fg)]">
          <ClipboardCheck className="h-4 w-4 text-[color:var(--color-primary)]" />
          Questions & answers
        </h2>
        {assessment.questions.map((q, i) => {
          const answer = answersById.get(q.id);
          const isCorrectMcq =
            q.question_type === "mcq" &&
            (answer?.selected_option_ids ?? []).every((id) =>
              q.options?.find((o) => o.id === id)?.is_correct,
            ) &&
            (answer?.selected_option_ids?.length ?? 0) > 0;
          const score = answer?.mentor_score ?? answer?.ai_score;
          return (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-fg-muted)]">
                  <span className="text-[color:var(--color-primary-active)]">
                    Q{i + 1}
                  </span>
                  <span>· {q.question_type.replace("_", " ")}</span>
                  {q.skill_tag ? <span>· #{q.skill_tag}</span> : null}
                  {q.difficulty ? <span>· {q.difficulty}</span> : null}
                  {score != null ? (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5",
                        score >= 0.7
                          ? "bg-emerald-100 text-emerald-800"
                          : score >= 0.4
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800",
                      )}
                    >
                      {Math.round(score * 100)}%
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-[color:var(--color-fg)] whitespace-pre-wrap">
                  {q.prompt}
                </p>

                {q.question_type === "mcq" && q.options ? (
                  <ul className="space-y-1">
                    {q.options.map((o) => {
                      const picked = (answer?.selected_option_ids ?? []).includes(
                        o.id,
                      );
                      return (
                        <li
                          key={o.id}
                          className={cn(
                            "rounded-md px-2 py-1.5 text-sm",
                            o.is_correct
                              ? "bg-emerald-50 text-emerald-800"
                              : picked
                                ? "bg-rose-50 text-rose-800"
                                : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
                          )}
                        >
                          {picked ? "▸ " : "  "}
                          {o.label}
                          {o.is_correct ? " ✓" : ""}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-sm whitespace-pre-wrap">
                      {answer?.answer_text || (
                        <span className="italic text-[color:var(--color-fg-muted)]">
                          No answer.
                        </span>
                      )}
                    </div>
                    {q.expected_answer ? (
                      <p className="text-xs italic text-[color:var(--color-fg-muted)]">
                        Expected: {q.expected_answer}
                      </p>
                    ) : null}
                  </div>
                )}

                {answer?.ai_feedback ? (
                  <div className="rounded-md bg-[color:var(--color-primary-soft)] px-3 py-2 text-xs text-[color:var(--color-primary-active)]">
                    AI: {answer.ai_feedback}
                  </div>
                ) : null}
                {q.question_type === "mcq" && answer?.selected_option_ids?.length ? (
                  <div className="text-xs text-[color:var(--color-fg-muted)]">
                    {isCorrectMcq ? "Correct." : "Incorrect."}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
