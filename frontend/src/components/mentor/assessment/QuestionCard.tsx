"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pencil, Trash2, Wand2, Check, X, Plus, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  AssessmentDifficulty,
  AssessmentOption,
  AssessmentQuestion,
  AssessmentQuestionType,
} from "@/types";

interface Props {
  question: AssessmentQuestion;
  index: number;
  onSave(updated: Partial<AssessmentQuestion>): Promise<void> | void;
  onDelete(): void;
  onRegenerate(): void;
  isRegenerating?: boolean;
}

const TYPE_LABELS: Record<AssessmentQuestionType, string> = {
  mcq: "Multiple choice",
  short_answer: "Short answer",
  scenario: "Scenario",
};

const DIFF_COLORS: Record<AssessmentDifficulty, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-rose-100 text-rose-800",
};

export function QuestionCard({
  question,
  index,
  onSave,
  onDelete,
  onRegenerate,
  isRegenerating,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [editing, setEditing] = React.useState(false);
  const [prompt, setPrompt] = React.useState(question.prompt);
  const [expected, setExpected] = React.useState(question.expected_answer ?? "");
  const [options, setOptions] = React.useState<AssessmentOption[]>(
    question.options ?? [],
  );
  const [skillTag, setSkillTag] = React.useState(question.skill_tag ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    // Re-sync local editable state when the question prop is replaced
    // (e.g. after a regenerate).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrompt(question.prompt);
    setExpected(question.expected_answer ?? "");
    setOptions(question.options ?? []);
    setSkillTag(question.skill_tag ?? "");
  }, [question]);

  const cancel = () => {
    setPrompt(question.prompt);
    setExpected(question.expected_answer ?? "");
    setOptions(question.options ?? []);
    setSkillTag(question.skill_tag ?? "");
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave({
        prompt,
        expected_answer: expected || null,
        options: question.question_type === "mcq" ? options : null,
        skill_tag: skillTag || null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const setOption = (idx: number, patch: Partial<AssessmentOption>) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)),
    );
  };

  const toggleCorrect = (idx: number) => {
    setOptions((prev) =>
      prev.map((o, i) => ({ ...o, is_correct: i === idx })),
    );
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: `o${prev.length}`, label: "", is_correct: false },
    ]);
  };

  const removeOption = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={cn(
        "rounded-xl border bg-[color:var(--color-surface)] p-4 shadow-sm",
        "border-[color:var(--color-border)]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center pt-1 text-[color:var(--color-fg-faint)]">
          <GripVertical className="h-3.5 w-3.5" />
          <span className="mt-1 text-xs font-semibold text-[color:var(--color-fg-muted)]">
            Q{index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[color:var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-primary-active)]">
              {TYPE_LABELS[question.question_type]}
            </span>
            {question.difficulty ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  DIFF_COLORS[question.difficulty],
                )}
              >
                {question.difficulty}
              </span>
            ) : null}
            {question.skill_tag && !editing ? (
              <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-fg-muted)]">
                #{question.skill_tag}
              </span>
            ) : null}
            <div className="ml-auto flex items-center gap-1">
              {!editing ? (
                <>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    title="Regenerate this question with AI"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setEditing(true)}
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={onDelete}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={cancel}
                    disabled={saving}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="default"
                    onClick={save}
                    disabled={saving || !prompt.trim()}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <Textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Question prompt"
              />
              <Input
                value={skillTag}
                onChange={(e) => setSkillTag(e.target.value)}
                placeholder="Skill tag (e.g., git, react)"
              />
              {question.question_type === "mcq" ? (
                <div className="space-y-2">
                  <Label className="text-xs">Options (check the correct one)</Label>
                  {options.map((o, i) => (
                    <div key={o.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={o.is_correct}
                        onCheckedChange={() => toggleCorrect(i)}
                      />
                      <Input
                        value={o.label}
                        onChange={(e) => setOption(i, { label: e.target.value })}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeOption(i)}
                        disabled={options.length <= 2}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addOption}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add option
                  </Button>
                </div>
              ) : (
                <Textarea
                  rows={2}
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  placeholder="Expected answer (used by the AI evaluator)"
                />
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[color:var(--color-fg)] whitespace-pre-wrap">
                {question.prompt}
              </p>
              {question.question_type === "mcq" && question.options ? (
                <ul className="space-y-1.5">
                  {question.options.map((o) => (
                    <li
                      key={o.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                        o.is_correct
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-semibold",
                          o.is_correct
                            ? "border-emerald-600 bg-emerald-100 text-emerald-700"
                            : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-faint)]",
                        )}
                      >
                        {o.is_correct ? "✓" : ""}
                      </span>
                      <span className="truncate">{o.label}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {question.question_type !== "mcq" && question.expected_answer ? (
                <p className="text-xs italic text-[color:var(--color-fg-muted)]">
                  Expected: {question.expected_answer}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
