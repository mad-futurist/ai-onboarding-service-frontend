"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  addQuestion as addQuestionApi,
  deleteQuestion as deleteQuestionApi,
  regenerateAssessment,
  updateQuestion,
} from "@/services/assessments";
import { toApiError } from "@/lib/api";
import type { Assessment, AssessmentQuestion, ID } from "@/types";

import { QuestionCard } from "./QuestionCard";

interface Props {
  assessment: Assessment;
  onChange(next: Assessment): void;
}

export function AssessmentDraftEditor({ assessment, onChange }: Props) {
  const qc = useQueryClient();
  const [regenAllPending, setRegenAllPending] = React.useState(false);
  const [regenQuestionId, setRegenQuestionId] = React.useState<ID | null>(null);

  const refetchKey = ["assessment", assessment.id];

  const regenAll = useMutation({
    mutationFn: () =>
      regenerateAssessment(assessment.id, {
        scope: "all",
        mentor_notes: assessment.mentor_notes ?? undefined,
        document_ids: assessment.source_document_ids ?? [],
      }),
    onMutate: () => setRegenAllPending(true),
    onSettled: () => setRegenAllPending(false),
    onSuccess: (next) => {
      onChange(next);
      qc.invalidateQueries({ queryKey: refetchKey });
      toast.success("Assessment regenerated");
    },
    onError: (err) =>
      toast.error("Couldn't regenerate", { description: toApiError(err).message }),
  });

  const regenOne = useMutation({
    mutationFn: (questionId: ID) =>
      regenerateAssessment(assessment.id, {
        scope: "question",
        target_id: questionId,
        mentor_notes: assessment.mentor_notes ?? undefined,
        document_ids: assessment.source_document_ids ?? [],
      }),
    onMutate: (questionId) => setRegenQuestionId(questionId),
    onSettled: () => setRegenQuestionId(null),
    onSuccess: (next) => {
      onChange(next);
      toast.success("Question regenerated");
    },
    onError: (err) =>
      toast.error("Couldn't regenerate question", {
        description: toApiError(err).message,
      }),
  });

  const updateOne = useMutation({
    mutationFn: ({
      questionId,
      patch,
    }: {
      questionId: ID;
      patch: Partial<AssessmentQuestion>;
    }) =>
      updateQuestion(assessment.id, questionId, {
        prompt: patch.prompt,
        expected_answer: patch.expected_answer ?? null,
        options: patch.options ?? null,
        skill_tag: patch.skill_tag ?? null,
        question_type: patch.question_type,
      }),
    onSuccess: (updated) => {
      onChange({
        ...assessment,
        questions: assessment.questions.map((q) =>
          q.id === updated.id ? updated : q,
        ),
      });
      toast.success("Question updated");
    },
    onError: (err) =>
      toast.error("Couldn't save", { description: toApiError(err).message }),
  });

  const deleteOne = useMutation({
    mutationFn: (questionId: ID) => deleteQuestionApi(assessment.id, questionId),
    onSuccess: (_, questionId) => {
      onChange({
        ...assessment,
        questions: assessment.questions.filter((q) => q.id !== questionId),
      });
      toast.success("Question removed");
    },
    onError: (err) =>
      toast.error("Couldn't delete", { description: toApiError(err).message }),
  });

  const addManual = useMutation({
    mutationFn: () =>
      addQuestionApi(assessment.id, {
        question_type: "short_answer",
        prompt: "New question — edit me.",
        expected_answer: "",
        skill_tag: "general",
        difficulty: "medium",
      }),
    onSuccess: (q) => {
      onChange({ ...assessment, questions: [...assessment.questions, q] });
    },
    onError: (err) =>
      toast.error("Couldn't add", { description: toApiError(err).message }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--color-fg)]">
            Draft questions ({assessment.questions.length})
          </h3>
          <p className="text-xs text-[color:var(--color-fg-muted)]">
            Edit, regenerate, or add your own. Publishing happens when you finish
            the wizard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => regenAll.mutate()}
            disabled={regenAllPending}
          >
            {regenAllPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Regenerate all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="soft"
            onClick={() => addManual.mutate()}
            disabled={addManual.isPending}
          >
            <Plus className="h-3.5 w-3.5" /> Add question
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {assessment.questions.map((q, i) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 250, damping: 26 }}
            >
              <QuestionCard
                question={q}
                index={i}
                isRegenerating={regenQuestionId === q.id}
                onRegenerate={() => regenOne.mutate(q.id)}
                onDelete={() => deleteOne.mutate(q.id)}
                onSave={async (patch) => {
                  await updateOne.mutateAsync({ questionId: q.id, patch });
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {assessment.used_fallback ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          The AI fallback was used (model failed or returned invalid output). Feel
          free to regenerate.
        </p>
      ) : null}
    </div>
  );
}
