"use client";

import * as React from "react";
import { Check, Sparkles, Zap, Wand2, Plus, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SourcesPicker } from "@/components/mentor/plan-generator/SourcesPicker";
import { cn } from "@/lib/utils";
import type { AssessmentQuestionType, ID } from "@/types";

export interface AssessmentGeneratorInputs {
  mentorNotes: string;
  documentIds: ID[];
  questionTypes: AssessmentQuestionType[];
  questionCount: number;
}

interface Props {
  initial?: Partial<AssessmentGeneratorInputs>;
  isGenerating?: boolean;
  mode?: "fast" | "live" | null;
  onGenerate(inputs: AssessmentGeneratorInputs, mode: "fast" | "live"): void;
}

const TYPE_LABELS: Record<AssessmentQuestionType, string> = {
  mcq: "Multiple choice",
  short_answer: "Short answer",
  scenario: "Scenario",
};

export function AssessmentGeneratorPanel({
  initial,
  isGenerating,
  mode,
  onGenerate,
}: Props) {
  const [mentorNotes, setMentorNotes] = React.useState(initial?.mentorNotes ?? "");
  const [selectedDocs, setSelectedDocs] = React.useState<Set<ID>>(
    new Set(initial?.documentIds ?? []),
  );
  const [types, setTypes] = React.useState<Set<AssessmentQuestionType>>(
    new Set(initial?.questionTypes ?? ["mcq", "short_answer", "scenario"]),
  );
  const [count, setCount] = React.useState(initial?.questionCount ?? 6);

  const toggleType = (t: AssessmentQuestionType) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        if (next.size > 1) next.delete(t);
      } else {
        next.add(t);
      }
      return next;
    });
  };

  const toggleDoc = (id: ID) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const build = (m: "fast" | "live") => {
    onGenerate(
      {
        mentorNotes,
        documentIds: Array.from(selectedDocs),
        questionTypes: Array.from(types),
        questionCount: count,
      },
      m,
    );
  };

  return (
    <div className="rounded-xl border border-[color:var(--color-primary-soft)] bg-gradient-to-br from-[color:var(--color-primary-softer)] to-transparent p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[color:var(--color-primary-active)]" />
        <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
          Generate skill assessment with AI
        </h3>
      </div>
      <p className="text-xs text-[color:var(--color-fg-muted)] -mt-2">
        Describe what you want to probe. The AI uses the role context, your notes
        and the selected sources to design a short skill check the newcomer takes
        on day 1.
      </p>

      <div className="space-y-1.5">
        <Label>Mentor notes (what should the test cover?)</Label>
        <Textarea
          rows={3}
          placeholder="Focus on git fluency, our deployment flow, and async communication."
          value={mentorNotes}
          onChange={(e) => setMentorNotes(e.target.value)}
        />
      </div>

      <details className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
        <summary className="cursor-pointer text-xs font-medium text-[color:var(--color-fg)]">
          Sources to ground the questions{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            ({selectedDocs.size} selected)
          </span>
        </summary>
        <div className="mt-3">
          <SourcesPicker
            selected={selectedDocs}
            onToggle={toggleDoc}
            maxHeight="max-h-56"
          />
        </div>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Question types</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_LABELS) as AssessmentQuestionType[]).map((t) => {
              const on = types.has(t);
              return (
                <button
                  type="button"
                  key={t}
                  aria-pressed={on}
                  onClick={() => toggleType(t)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    on
                      ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
                      : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border shadow-sm transition-colors",
                      on
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                        : "border-[color:var(--color-border-strong)] bg-white text-transparent",
                    )}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Number of questions</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => setCount((c) => Math.max(3, c - 1))}
              disabled={count <= 3}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <div className="min-w-12 text-center text-lg font-semibold text-[color:var(--color-fg)]">
              {count}
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => setCount((c) => Math.min(15, c + 1))}
              disabled={count >= 15}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-[color:var(--color-fg-muted)]">3-15</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          variant="default"
          onClick={() => build("fast")}
          disabled={isGenerating}
        >
          <Zap className="h-4 w-4" />
          {isGenerating && mode === "fast" ? "Generating…" : "Generate (fast)"}
        </Button>
        <Button
          type="button"
          variant="ai"
          onClick={() => build("live")}
          disabled={isGenerating}
        >
          <Wand2 className="h-4 w-4" />
          {isGenerating && mode === "live" ? "Streaming…" : "Generate live"}
        </Button>
      </div>
    </div>
  );
}
