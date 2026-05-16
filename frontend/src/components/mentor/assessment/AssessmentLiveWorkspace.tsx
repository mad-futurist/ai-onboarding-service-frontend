"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  startAssessmentStream,
  type AssessmentStreamEvent,
  type StartAssessmentStreamInput,
} from "@/services/assessment-stream";
import type {
  AssessmentDifficulty,
  AssessmentOption,
  AssessmentQuestionType,
} from "@/types";

interface PendingQuestion {
  tempId: string;
  orderIndex: number;
  questionType: AssessmentQuestionType;
  difficulty: AssessmentDifficulty;
  skillTag: string;
  promptParts: string[];
  options: AssessmentOption[];
  complete: boolean;
}

interface Props {
  input: StartAssessmentStreamInput;
  onClose(): void;
  onDone(): void;
}

export function AssessmentLiveWorkspace({ input, onClose, onDone }: Props) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = React.useState<string>("starting");
  const [sources, setSources] = React.useState<
    { id: string; title: string; score: number }[]
  >([]);
  const [questions, setQuestions] = React.useState<PendingQuestion[]>([]);
  const [done, setDone] = React.useState(false);

  const handleRef = React.useRef<ReturnType<typeof startAssessmentStream> | null>(null);

  React.useEffect(() => {
    const handler = (e: AssessmentStreamEvent) => {
      if (e.type === "phase") setPhase(e.label);
      else if (e.type === "source") {
        setSources((prev) => [...prev, { id: e.id, title: e.title, score: e.score }]);
      } else if (e.type === "question_start") {
        setQuestions((prev) => [
          ...prev,
          {
            tempId: e.tempId,
            orderIndex: e.orderIndex,
            questionType: e.questionType,
            difficulty: e.difficulty,
            skillTag: e.skillTag,
            promptParts: [],
            options: [],
            complete: false,
          },
        ]);
      } else if (e.type === "prompt_token") {
        setQuestions((prev) =>
          prev.map((q) =>
            q.tempId === e.tempId
              ? { ...q, promptParts: [...q.promptParts, e.delta] }
              : q,
          ),
        );
      } else if (e.type === "option") {
        setQuestions((prev) =>
          prev.map((q) =>
            q.tempId === e.tempId ? { ...q, options: [...q.options, e.option] } : q,
          ),
        );
      } else if (e.type === "question_complete") {
        setQuestions((prev) =>
          prev.map((q) => (q.tempId === e.tempId ? { ...q, complete: true } : q)),
        );
      } else if (e.type === "done") {
        setDone(true);
      }
    };

    handleRef.current = startAssessmentStream(input, handler);
    return () => {
      handleRef.current?.stop();
    };
  }, [input]);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={reduceMotion ? false : { y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="relative w-full max-w-3xl flex flex-col rounded-2xl border border-white/10 bg-[color:var(--color-surface)] shadow-2xl overflow-hidden"
      >
        <div className="ai-gradient text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <div>
              <div className="text-sm font-semibold">Building the skill check</div>
              <div className="text-xs opacity-80">{phase}</div>
            </div>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/15"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {sources.length ? (
            <section>
              <h4 className="text-[10px] uppercase tracking-wide font-semibold text-[color:var(--color-fg-muted)] mb-2">
                Grounded on
              </h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full bg-[color:var(--color-primary-soft)] px-2.5 py-1 text-xs text-[color:var(--color-primary-active)]"
                  >
                    {s.title} <span className="opacity-60">·{Math.round(s.score * 100)}%</span>
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <AnimatePresence initial={false}>
              {questions.map((q) => (
                <motion.div
                  key={q.tempId}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className={cn(
                    "rounded-lg border bg-[color:var(--color-surface)] p-3",
                    "border-[color:var(--color-border)]",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-[color:var(--color-fg-muted)]">
                    <span className="font-semibold text-[color:var(--color-primary-active)]">
                      Q{q.orderIndex + 1}
                    </span>
                    <span>· {q.questionType.replace("_", " ")}</span>
                    <span>· {q.difficulty}</span>
                    <span>· #{q.skillTag}</span>
                    {q.complete ? <span className="text-emerald-600">· ready</span> : null}
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--color-fg)]">
                    {q.promptParts.join("")}
                    {!q.complete ? (
                      <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-[color:var(--color-primary)] align-middle" />
                    ) : null}
                  </p>
                  {q.options.length ? (
                    <ul className="mt-2 space-y-1.5">
                      {q.options.map((o) => (
                        <li
                          key={o.id}
                          className={cn(
                            "rounded-md px-2 py-1 text-xs",
                            o.is_correct
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
                          )}
                        >
                          {o.label}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        </div>

        <div className="border-t border-[color:var(--color-border)] px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-[color:var(--color-fg-muted)]">
            Live preview — questions persist on completion.
          </span>
          <Button
            type="button"
            variant={done ? "default" : "ghost"}
            disabled={!done}
            onClick={onDone}
          >
            {done ? "Open draft" : "Generating…"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
