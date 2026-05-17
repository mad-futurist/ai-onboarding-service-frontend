"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Confetti } from "@/components/shared/Confetti";
import { cn } from "@/lib/utils";
import { submitAssessment } from "@/services/assessments";
import { toApiError } from "@/lib/api";
import { useLocale } from "@/providers/locale-provider";
import type {
  Assessment,
  AssessmentSubmissionAnswerInput,
  ID,
} from "@/types";

interface AnswerState {
  [questionId: number]: {
    text?: string;
    optionIds?: string[];
  };
}

interface Props {
  assessment: Assessment;
  newcomerId: ID;
}

export function AssessmentRunner({ assessment, newcomerId }: Props) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useLocale();
  const [cursor, setCursor] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [startedAt] = React.useState(() => Date.now());

  const total = assessment.questions.length;
  const question = assessment.questions[cursor];
  const isLast = cursor === total - 1;
  const progressPercent = ((cursor + 1) / total) * 100;

  const submitMut = useMutation({
    mutationFn: () => {
      const items: AssessmentSubmissionAnswerInput[] = assessment.questions.map(
        (q) => {
          const a = answers[q.id] ?? {};
          if (q.question_type === "mcq") {
            return {
              question_id: q.id,
              selected_option_ids: a.optionIds ?? [],
            };
          }
          return {
            question_id: q.id,
            answer_text: a.text ?? "",
          };
        },
      );
      const duration = Math.round((Date.now() - startedAt) / 1000);
      return submitAssessment(assessment.id, {
        newcomer_id: newcomerId,
        duration_seconds: duration,
        answers: items,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setConfettiTrigger((n) => n + 1);
      qc.invalidateQueries({ queryKey: ["newcomer-assessment", newcomerId] });
      qc.invalidateQueries({
        queryKey: ["newcomer-assessment-submission", assessment.id],
      });
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
      setTimeout(() => router.push("/newcomer"), 3200);
    },
    onError: (err) => {
      toast.error("Couldn't submit", { description: toApiError(err).message });
    },
  });

  const canAdvance = (): boolean => {
    if (!question) return false;
    const a = answers[question.id];
    if (question.question_type === "mcq") {
      return (a?.optionIds?.length ?? 0) > 0;
    }
    return !!a?.text?.trim();
  };

  const goNext = () => {
    if (!canAdvance()) return;
    if (isLast) {
      submitMut.mutate();
      return;
    }
    setDirection(1);
    setCursor((c) => Math.min(total - 1, c + 1));
  };

  const goPrev = () => {
    setDirection(-1);
    setCursor((c) => Math.max(0, c - 1));
  };

  const setOption = (optionId: string) => {
    if (!question) return;
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { optionIds: [optionId] },
    }));
  };

  const setText = (text: string) => {
    if (!question) return;
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { text },
    }));
  };

  if (submitted) {
    return (
      <div
        className="relative flex min-h-[60vh] flex-col items-center justify-center text-center px-4"
        data-demo-id="assessment-submitted"
      >
        <Confetti trigger={confettiTrigger} />
        <motion.div
          initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full ai-gradient text-white shadow-2xl"
        >
          <Check className="h-10 w-10" />
        </motion.div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("assessment.runner.done.title")}
        </h1>
        <p className="mt-2 max-w-md text-sm text-[color:var(--color-fg-muted)]">
          {t("assessment.runner.done.body")}
        </p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-[color:var(--color-fg-muted)]">
        {t("assessment.runner.empty")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6" data-demo-id="assessment-runner">
      <header className="space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[color:var(--color-fg-muted)]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--color-primary-active)]">
            <Sparkles className="h-3.5 w-3.5" /> {t("assessment.runner.eyebrow")}
          </span>
          <span>
            {t("assessment.runner.progress", {
              current: cursor + 1,
              total,
            })}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
          <motion.div
            className="h-full rounded-full ai-gradient"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 24 }}
          />
        </div>
      </header>

      <div className="relative overflow-hidden min-h-[320px]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.section
            key={question.id}
            custom={direction}
            initial={reduceMotion ? false : { opacity: 0, x: 60 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -60 * direction }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-lg"
            data-demo-id="assessment-question-card"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
              {question.skill_tag ? (
                <span className="rounded-full bg-[color:var(--color-primary-soft)] px-2 py-0.5 text-[color:var(--color-primary-active)]">
                  #{question.skill_tag}
                </span>
              ) : null}
              {question.difficulty ? (
                <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[color:var(--color-fg-muted)]">
                  {question.difficulty}
                </span>
              ) : null}
              <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[color:var(--color-fg-muted)]">
                {question.question_type.replace("_", " ")}
              </span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-fg)] whitespace-pre-wrap">
              {question.prompt}
            </h2>
            {question.context ? (
              <p className="mt-2 text-sm text-[color:var(--color-fg-muted)] whitespace-pre-wrap">
                {question.context}
              </p>
            ) : null}

            <div className="mt-5">
              {question.question_type === "mcq" && question.options ? (
                <ul className="space-y-2">
                  {question.options.map((o, i) => {
                    const selected =
                      (answers[question.id]?.optionIds ?? []).includes(o.id);
                    return (
                      <motion.li
                        key={o.id}
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                      >
                        <button
                          type="button"
                          onClick={() => setOption(o.id)}
                          data-demo-id={i === 0 ? "assessment-option" : undefined}
                          className={cn(
                            "w-full text-left rounded-xl border px-4 py-3 transition-all",
                            selected
                              ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)] shadow-sm"
                              : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-primary-ring)]",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                                selected
                                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]"
                                  : "border-[color:var(--color-border)]",
                              )}
                            >
                              {selected ? (
                                <motion.span
                                  initial={reduceMotion ? false : { scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="h-2 w-2 rounded-full bg-white"
                                />
                              ) : null}
                            </span>
                            <span className="text-sm text-[color:var(--color-fg)]">
                              {o.label}
                            </span>
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <Textarea
                  autoFocus
                  rows={question.question_type === "scenario" ? 6 : 4}
                  data-demo-id="assessment-answer-input"
                  placeholder={
                    question.question_type === "scenario"
                      ? t("assessment.runner.placeholderScenario")
                      : t("assessment.runner.placeholderShort")
                  }
                  value={answers[question.id]?.text ?? ""}
                  onChange={(e) => setText(e.target.value)}
                />
              )}
            </div>
          </motion.section>
        </AnimatePresence>
      </div>

      <footer className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={goPrev}
          disabled={cursor === 0}
        >
          <ArrowLeft className="h-4 w-4" /> {t("assessment.runner.back")}
        </Button>
        <div className="flex items-center gap-1">
          {assessment.questions.map((q, i) => {
            const answered = !!answers[q.id];
            return (
              <span
                key={q.id}
                className={cn(
                  "h-1.5 w-4 rounded-full transition-colors",
                  i === cursor
                    ? "bg-[color:var(--color-primary)]"
                    : answered
                      ? "bg-[color:var(--color-primary-soft)]"
                      : "bg-[color:var(--color-surface-muted)]",
                )}
              />
            );
          })}
        </div>
        <Button
          type="button"
          variant="ai"
          onClick={goNext}
          disabled={!canAdvance() || submitMut.isPending}
          data-demo-id="assessment-runner-next"
        >
          {isLast
            ? submitMut.isPending
              ? t("assessment.runner.submitting")
              : t("assessment.runner.submit")
            : t("assessment.runner.next")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}
