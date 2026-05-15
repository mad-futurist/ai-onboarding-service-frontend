"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  HelpCircle,
  Loader2,
  MessageSquarePlus,
  Mic,
  Pause,
  Play,
  Send,
  Sparkles,
  SquareDashedKanban,
  Wand2,
  X,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { startPlanStream, type LiveStreamHandle } from "@/services/plan-stream";
import type { LiveStreamEvent, LiveStreamQuestion, Newcomer } from "@/types";

interface LiveModeWorkspaceProps {
  newcomer: Newcomer;
  periodLabel: string;
  periodGoal: string;
  mentorNotes: string;
  selectedSourcesCount: number;
  generating: boolean;
  onClose: () => void;
  onCommit: (finalNotes: string) => void;
}

type Phase = "idle" | "profile" | "sources" | "reasoning" | "drafting" | "ready" | "error";

interface ThoughtBlock {
  id: string;
  text: string;
  done: boolean;
}

interface SourceCard {
  id: string;
  title: string;
  score: number;
}

interface TaskCard {
  id: string;
  weekIndex: number;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  done: boolean;
}

interface WeekBlock {
  index: number;
  title: string;
  goal?: string | null;
  status: "writing" | "ready";
}

interface PendingQuestion extends LiveStreamQuestion {
  answer?: string;
  resolved: boolean;
}

const PHASE_ORDER: Phase[] = ["profile", "sources", "reasoning", "drafting", "ready"];

const PHASE_META: Record<Phase, { label: string; icon: React.ReactNode }> = {
  idle: { label: "Idle", icon: <Mic className="h-3.5 w-3.5" /> },
  profile: { label: "Profile", icon: <Sparkles className="h-3.5 w-3.5" /> },
  sources: { label: "Sources", icon: <FileText className="h-3.5 w-3.5" /> },
  reasoning: { label: "Reasoning", icon: <Eye className="h-3.5 w-3.5" /> },
  drafting: { label: "Drafting", icon: <SquareDashedKanban className="h-3.5 w-3.5" /> },
  ready: { label: "Ready", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  error: { label: "Error", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

export function LiveModeWorkspace(props: LiveModeWorkspaceProps) {
  const {
    newcomer,
    periodLabel,
    periodGoal,
    mentorNotes,
    selectedSourcesCount,
    generating,
    onClose,
    onCommit,
  } = props;
  const reduce = useReducedMotion();

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [paused, setPaused] = React.useState(false);
  const [thoughts, setThoughts] = React.useState<ThoughtBlock[]>([]);
  const [sources, setSources] = React.useState<SourceCard[]>([]);
  const [warnings, setWarnings] = React.useState<{ id: string; message: string }[]>([]);
  const [weeks, setWeeks] = React.useState<WeekBlock[]>([]);
  const [tasks, setTasks] = React.useState<TaskCard[]>([]);
  const [questions, setQuestions] = React.useState<PendingQuestion[]>([]);
  const [comments, setComments] = React.useState<{ id: string; body: string }[]>([]);
  const [commentDraft, setCommentDraft] = React.useState("");
  const [eventCount, setEventCount] = React.useState(0);

  const handleRef = React.useRef<LiveStreamHandle | null>(null);

  const onEvent = React.useCallback((event: LiveStreamEvent) => {
    setEventCount((c) => c + 1);
    switch (event.type) {
      case "phase": {
        const map: Record<typeof event.phase, Phase> = {
          profile: "profile",
          sources: "sources",
          reasoning: "reasoning",
          drafting: "drafting",
          done: "ready",
        };
        setPhase(map[event.phase]);
        return;
      }
      case "thinking": {
        setThoughts((prev) => {
          const existing = prev.find((t) => t.id === event.id);
          if (!existing) {
            if (event.done) return prev;
            return [...prev, { id: event.id, text: event.delta, done: false }];
          }
          return prev.map((t) =>
            t.id === event.id
              ? { ...t, text: t.text + (event.delta ?? ""), done: !!event.done }
              : t,
          );
        });
        return;
      }
      case "source": {
        setSources((prev) =>
          prev.some((s) => s.id === event.id)
            ? prev
            : [...prev, { id: event.id, title: event.title, score: event.score }],
        );
        return;
      }
      case "warning": {
        setWarnings((prev) =>
          prev.some((w) => w.id === event.id) ? prev : [...prev, { id: event.id, message: event.message }],
        );
        return;
      }
      case "question": {
        setQuestions((prev) =>
          prev.some((q) => q.id === event.id)
            ? prev
            : [...prev, { ...event, resolved: false }],
        );
        return;
      }
      case "week": {
        setWeeks((prev) => {
          const idx = prev.findIndex((w) => w.index === event.index);
          if (idx === -1) {
            return [
              ...prev,
              { index: event.index, title: event.title, goal: event.goal ?? null, status: event.status },
            ].sort((a, b) => a.index - b.index);
          }
          const next = [...prev];
          next[idx] = { ...next[idx], title: event.title, goal: event.goal ?? next[idx].goal, status: event.status };
          return next;
        });
        return;
      }
      case "task": {
        setTasks((prev) => {
          const existing = prev.find((t) => t.id === event.id);
          if (!existing) {
            return [
              ...prev,
              {
                id: event.id,
                weekIndex: event.week_index,
                title: event.title,
                description: event.description_delta ?? "",
                priority: event.priority,
                done: !!event.done,
              },
            ];
          }
          return prev.map((t) =>
            t.id === event.id
              ? {
                  ...t,
                  description: t.description + (event.description_delta ?? ""),
                  priority: event.priority ?? t.priority,
                  done: event.done ?? t.done,
                }
              : t,
          );
        });
        return;
      }
      case "comment_ack": {
        setComments((prev) =>
          prev.some((c) => c.id === event.id) ? prev : [...prev, { id: event.id, body: event.body }],
        );
        return;
      }
      case "done": {
        setPhase("ready");
        return;
      }
      case "error": {
        setPhase("error");
        return;
      }
    }
  }, []);

  const start = React.useCallback(() => {
    setPhase("profile");
    setPaused(false);
    setThoughts([]);
    setSources([]);
    setWarnings([]);
    setWeeks([]);
    setTasks([]);
    setQuestions([]);
    setComments([]);
    setEventCount(0);

    handleRef.current?.stop();
    handleRef.current = startPlanStream(
      {
        newcomer,
        periodLabel,
        periodGoal,
        mentorNotes,
        selectedDocumentCount: selectedSourcesCount,
      },
      onEvent,
    );
  }, [newcomer, periodLabel, periodGoal, mentorNotes, selectedSourcesCount, onEvent]);

  React.useEffect(() => {
    // Auto-start as soon as the workspace mounts.
    start();
    return () => handleRef.current?.stop();
  }, [start]);

  const togglePause = () => {
    if (!handleRef.current) return;
    if (paused) {
      handleRef.current.resume();
      setPaused(false);
    } else {
      handleRef.current.pause();
      setPaused(true);
    }
  };

  const sendAnswer = (questionId: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answer, resolved: true } : q)),
    );
    handleRef.current?.sendAnswer(questionId, answer);
  };

  const sendComment = () => {
    const body = commentDraft.trim();
    if (!body) return;
    handleRef.current?.sendComment(body);
    setCommentDraft("");
  };

  const progress = computeProgress(phase, weeks, tasks);
  const allQuestionsAnswered = questions.every((q) => q.resolved);
  const canCommit = phase === "ready" && allQuestionsAnswered && !generating;

  const buildFinalNotes = () => {
    const answers = questions
      .filter((q) => q.resolved && q.answer)
      .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
      .join("\n\n");
    const liveComments = comments.map((c) => `- ${c.body}`).join("\n");
    return [
      answers ? `Resolved AI doubts:\n${answers}` : "",
      liveComments ? `Live mentor comments:\n${liveComments}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/55 backdrop-blur-[3px]"
      />

      {/* Window */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-2 bottom-2 top-4 mx-auto flex max-w-[1200px] flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-elevated)] sm:inset-4"
      >
        {/* Header */}
        <header className="relative border-b border-[color:var(--color-border)] bg-gradient-to-b from-white to-[color:var(--color-bg)] px-5 py-3">
          <div className="absolute inset-x-0 top-0 h-[2px] ai-gradient" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative grid h-9 w-9 place-items-center rounded-xl ai-gradient text-white shadow-[var(--shadow-ai)]">
                <Mic className="h-4 w-4" />
                {phase !== "ready" && phase !== "idle" && phase !== "error" ? (
                  <span className="absolute -right-0.5 -top-0.5 grid h-3 w-3 place-items-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-primary)]/60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[color:var(--color-primary)] ring-2 ring-white" />
                  </span>
                ) : null}
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
                  Live generation
                </div>
                <div className="text-sm font-semibold text-[color:var(--color-fg)]">
                  {periodLabel || "New period"} ·{" "}
                  <span className="text-[color:var(--color-fg-muted)]">{newcomer.full_name ?? `Newcomer #${newcomer.id}`}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral" size="sm">
                <Zap className="h-3 w-3" /> {eventCount} events
              </Badge>
              {phase !== "ready" && phase !== "error" ? (
                <Button size="sm" variant="outline" onClick={togglePause}>
                  {paused ? (
                    <>
                      <Play className="h-3.5 w-3.5" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </>
                  )}
                </Button>
              ) : null}
              <Button size="sm" variant="ai" disabled={!canCommit} onClick={() => onCommit(buildFinalNotes())}>
                {generating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Committing…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" /> Commit draft
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>

          {/* Phase strip */}
          <PhaseStrip phase={phase} progress={progress} />
        </header>

        {/* Body: 2 columns */}
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Left: AI stream */}
          <section className="flex min-h-0 flex-col overflow-hidden border-r border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
            <div className="border-b border-[color:var(--color-border)] bg-white/60 px-5 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                AI stream
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {warnings.length ? (
                <div className="rounded-xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning-soft)] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-warning-fg)]">
                    <AlertTriangle className="h-3 w-3" /> Watch-outs
                  </div>
                  <ul className="mt-1 space-y-0.5 text-xs text-[color:var(--color-fg)]">
                    {warnings.map((w) => (
                      <li key={w.id}>· {w.message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {sources.length ? (
                <div className="rounded-xl border border-[color:var(--color-border)] bg-white p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    Sources ranked
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-[color:var(--color-fg)]">
                    {sources.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <FileText className="h-3 w-3 shrink-0 text-[color:var(--color-fg-subtle)]" />
                          <span className="truncate">{s.title}</span>
                        </span>
                        <Badge tone={s.score >= 0.8 ? "ai" : "neutral"} size="sm">
                          {s.score.toFixed(2)}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {thoughts.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3"
                  >
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full ai-gradient text-white shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2 shadow-sm">
                      <p className="text-sm leading-relaxed text-[color:var(--color-fg)]">
                        {t.text}
                        {!t.done ? <BlinkCaret /> : null}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {phase === "idle" ? (
                <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white px-3 py-6 text-center text-xs text-[color:var(--color-fg-muted)]">
                  Waiting for the AI to start streaming…
                </div>
              ) : null}
            </div>

            {/* Comments bar */}
            <div className="border-t border-[color:var(--color-border)] bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Textarea
                  rows={1}
                  value={commentDraft}
                  placeholder="Steer the AI mid-flight (e.g. make week 1 lighter)…"
                  onChange={(e) => setCommentDraft(e.target.value)}
                  className="min-h-[36px] resize-none rounded-full px-3 py-1.5 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="ai"
                  onClick={sendComment}
                  disabled={!commentDraft.trim()}
                  className="rounded-full"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              {comments.length ? (
                <div className="mt-2 text-[10px] text-[color:var(--color-fg-subtle)]">
                  {comments.length} comment{comments.length === 1 ? "" : "s"} sent · last:{" "}
                  <span className="italic">&quot;{comments[comments.length - 1].body.slice(0, 60)}&quot;</span>
                </div>
              ) : null}
            </div>
          </section>

          {/* Right: plan preview */}
          <section className="flex min-h-0 flex-col overflow-hidden bg-white">
            <div className="border-b border-[color:var(--color-border)] px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  Plan preview (live)
                </div>
                <Badge tone="neutral" size="sm">
                  {tasks.length} task{tasks.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {/* Question carousel */}
              {questions.filter((q) => !q.resolved).map((q) => (
                <QuestionCard key={q.id} question={q} onAnswer={(a) => sendAnswer(q.id, a)} />
              ))}

              {/* Weeks + tasks */}
              {weeks.length === 0 && tasks.length === 0 ? (
                <PreviewSkeleton />
              ) : (
                weeks.map((week) => (
                  <WeekBlockView
                    key={week.index}
                    week={week}
                    tasks={tasks.filter((t) => t.weekIndex === week.index)}
                  />
                ))
              )}

              {phase === "ready" ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-[color:var(--color-success)]/40 bg-[color:var(--color-success-soft)] p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-success-fg)]">
                    <CheckCircle2 className="h-4 w-4" /> Draft ready to commit
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                    All AI doubts resolved. The draft above will become the new period when you commit.
                  </p>
                </motion.div>
              ) : null}
            </div>
          </section>
        </div>

        {/* Status footer */}
        <footer className="border-t border-[color:var(--color-border)] bg-white px-5 py-2 text-[10px] text-[color:var(--color-fg-subtle)]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <MessageSquarePlus className="h-3 w-3" /> {comments.length} comment{comments.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1">
              <HelpCircle className="h-3 w-3" /> {questions.length} question{questions.length === 1 ? "" : "s"} ·{" "}
              {questions.filter((q) => q.resolved).length} answered
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" /> {sources.length} source{sources.length === 1 ? "" : "s"}
            </span>
            <span className="ml-auto inline-flex items-center gap-1">
              {paused ? (
                <span className="inline-flex items-center gap-1 text-[color:var(--color-warning-fg)]">
                  <Pause className="h-3 w-3" /> Paused
                </span>
              ) : phase === "ready" ? (
                <span className="inline-flex items-center gap-1 text-[color:var(--color-success-fg)]">
                  <CheckCircle2 className="h-3 w-3" /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[color:var(--color-primary-active)]">
                  <Sparkles className="h-3 w-3" /> Streaming
                </span>
              )}
            </span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

/* ---------- phase strip ---------- */

function PhaseStrip({ phase, progress }: { phase: Phase; progress: number }) {
  const currentIdx = PHASE_ORDER.indexOf(phase);
  return (
    <div className="mt-3">
      <ol className="flex items-center gap-1">
        {PHASE_ORDER.map((p, i) => {
          const meta = PHASE_META[p];
          const isDone = currentIdx > i;
          const isCurrent = currentIdx === i;
          return (
            <li
              key={p}
              className={cn(
                "inline-flex flex-1 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition",
                isDone &&
                  "border-[color:var(--color-success)]/40 bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]",
                isCurrent &&
                  "border-[color:var(--color-primary-ring)] bg-white text-[color:var(--color-primary-active)] shadow-[var(--shadow-ai)]",
                !isDone && !isCurrent &&
                  "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-subtle)]",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : isCurrent ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                meta.icon
              )}
              {meta.label}
            </li>
          );
        })}
      </ol>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
        <motion.div
          className="h-full rounded-full ai-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ---------- question card ---------- */

function QuestionCard({
  question,
  onAnswer,
}: {
  question: PendingQuestion;
  onAnswer: (answer: string) => void;
}) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [custom, setCustom] = React.useState("");

  const submit = () => {
    const value = custom.trim() || selected;
    if (!value) return;
    onAnswer(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="ai-border overflow-hidden rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
        <HelpCircle className="h-3.5 w-3.5" /> AI needs your input
      </div>
      <h4 className="mt-1 text-sm font-semibold text-[color:var(--color-fg)]">{question.question}</h4>
      <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">{question.reason}</p>

      {question.options?.length ? (
        <div className="mt-3 space-y-1.5">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(opt)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition",
                selected === opt
                  ? "border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
                  : "border-[color:var(--color-border)] bg-white hover:border-[color:var(--color-primary-ring)]",
              )}
            >
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded-full border",
                  selected === opt
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                    : "border-[color:var(--color-border-strong)] bg-white",
                )}
              >
                {selected === opt ? <CheckCircle2 className="h-3 w-3" /> : null}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        <Textarea
          rows={2}
          value={custom}
          placeholder="Or write a custom answer…"
          onChange={(e) => setCustom(e.target.value)}
        />
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => onAnswer("(Skipped — AI decides)")}>
          Skip
        </Button>
        <Button size="sm" variant="ai" disabled={!selected && !custom.trim()} onClick={submit}>
          <Send className="h-3.5 w-3.5" /> Send answer
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------- week + task ---------- */

function WeekBlockView({ week, tasks }: { week: WeekBlock; tasks: TaskCard[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            Week {week.index}
          </div>
          <div className="text-sm font-semibold text-[color:var(--color-fg)]">{week.title}</div>
          {week.goal ? (
            <p className="mt-0.5 text-xs text-[color:var(--color-fg-muted)]">{week.goal}</p>
          ) : null}
        </div>
        <Badge tone={week.status === "ready" ? "success" : "ai"} size="sm">
          {week.status === "ready" ? (
            <>
              <CheckCircle2 className="h-3 w-3" /> Ready
            </>
          ) : (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Writing
            </>
          )}
        </Badge>
      </div>
      <div className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-[color:var(--color-border)] bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
                    <span className="truncate text-sm font-semibold text-[color:var(--color-fg)]">{t.title}</span>
                  </div>
                  <p className="ml-5 mt-1 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
                    {t.description || <span className="italic text-[color:var(--color-fg-faint)]">writing…</span>}
                    {!t.done && t.description ? <BlinkCaret /> : null}
                  </p>
                </div>
                {t.priority ? (
                  <Badge
                    tone={t.priority === "high" ? "warning" : t.priority === "medium" ? "info" : "neutral"}
                    size="sm"
                  >
                    {t.priority}
                  </Badge>
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-dashed border-[color:var(--color-border)] bg-white p-4">
          <div className="h-3 w-20 animate-pulse rounded-full bg-[color:var(--color-surface-muted)]" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded-full bg-[color:var(--color-surface-muted)]" />
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-9 animate-pulse rounded-lg bg-[color:var(--color-surface-muted)]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BlinkCaret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 animate-pulse bg-[color:var(--color-primary)]"
    />
  );
}

function computeProgress(phase: Phase, weeks: WeekBlock[], tasks: TaskCard[]): number {
  if (phase === "ready") return 100;
  if (phase === "error") return 0;
  const baseByPhase: Record<Phase, number> = {
    idle: 0,
    profile: 10,
    sources: 25,
    reasoning: 40,
    drafting: 60,
    ready: 100,
    error: 0,
  };
  const draftingBoost = phase === "drafting"
    ? Math.min(35, weeks.filter((w) => w.status === "ready").length * 15 + tasks.length * 2)
    : 0;
  return Math.min(99, baseByPhase[phase] + draftingBoost);
}
