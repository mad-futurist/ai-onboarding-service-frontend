"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lightbulb, Send, Sparkles, ThumbsDown, ThumbsUp, Users } from "lucide-react";

import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { SourceCitation } from "@/components/ai/SourceCitation";
import { Markdown } from "@/components/shared/Markdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn, getInitials } from "@/lib/utils";
import { submitAnswerFeedback } from "@/services/ai";
import type { AIQuestionSource, ID } from "@/types";

export interface ChatMessage {
  question: string;
  questionId?: ID;
  pending?: boolean;
  errored?: string;
  answer?: string;
  sources?: AIQuestionSource[];
  peopleToAsk?: { name: string; role?: string }[];
}

interface AskAIChatProps {
  messages: ChatMessage[];
  newcomerName: string;
  suggestions: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  contextBanner?: React.ReactNode;
  isSubmitting: boolean;
  onSubmit: (question: string) => void;
}

export function AskAIChat({
  messages,
  newcomerName,
  suggestions,
  emptyTitle = "Start the conversation",
  emptyDescription = "Try one of the suggestions or ask anything.",
  contextBanner,
  isSubmitting,
  onSubmit,
}: AskAIChatProps) {
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const lastMessagePending = messages[messages.length - 1]?.pending;

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, lastMessagePending]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || isSubmitting) return;
    onSubmit(value);
    setDraft("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(draft);
  };

  const lastFollowups = messages[messages.length - 1]?.sources ? suggestions.slice(0, 4) : suggestions;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {contextBanner ? <div className="border-b border-[color:var(--color-border)] p-3">{contextBanner}</div> : null}

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5">
        {messages.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} suggestions={suggestions} onPick={submit} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((msg, idx) => (
              <ChatTurn key={idx} message={msg} name={newcomerName} />
            ))}
            {messages.length > 0 && lastFollowups.length ? (
              <FollowUpStrip suggestions={lastFollowups} onPick={submit} />
            ) : null}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[color:var(--color-border)] bg-white p-3 sm:p-4">
        <div className="mx-auto max-w-3xl">
          <div className="ai-border rounded-2xl" data-demo-id="ask-ai-composer">
            <div className="rounded-2xl bg-white p-2 shadow-[var(--shadow-elevated)]">
              <Textarea
                rows={4}
                placeholder="Ask anything about your team, processes, docs…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                data-demo-id="ask-ai-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(draft);
                  }
                }}
                className="border-0 shadow-none focus-visible:ring-0 rounded-xl resize-none"
              />
              <div className="flex items-center justify-between gap-2 px-2 pt-1">
                <span className="text-[11px] text-[color:var(--color-fg-subtle)]">
                  Press Enter to send · Shift+Enter for newline
                </span>
                <Button
                  type="submit"
                  variant="ai"
                  size="sm"
                  disabled={!draft.trim() || isSubmitting}
                  data-demo-id="ask-ai-submit"
                >
                  <Send className="h-3.5 w-3.5" /> Ask AI
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function EmptyState({
  title,
  description,
  suggestions,
  onPick,
}: {
  title: string;
  description: string;
  suggestions: string[];
  onPick: (q: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl ai-gradient text-white shadow-[var(--shadow-ai)]">
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <div className="text-base font-semibold">{title}</div>
        <div className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{description}</div>
      </div>
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="flex items-center justify-between gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-left text-sm text-[color:var(--color-fg)] hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/40"
          >
            <span className="truncate">{q}</span>
            <Send className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function FollowUpStrip({ suggestions, onPick }: { suggestions: string[]; onPick: (q: string) => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        <Lightbulb className="h-3 w-3" /> Follow-ups
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-full border border-[color:var(--color-border)] bg-white px-2.5 py-1 text-xs hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/40"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatTurn({ message, name }: { message: ChatMessage; name: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-2xl rounded-tl-md bg-[color:var(--color-surface-muted)] p-3 text-sm text-[color:var(--color-fg)] whitespace-pre-wrap">
          {message.question}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full ai-gradient text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          {message.pending ? (
            <AIInsightCard title="Thinking…" tone="soft">
              <div className="space-y-2">
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </AIInsightCard>
          ) : message.errored ? (
            <AIInsightCard title="Something went wrong" description={message.errored} tone="soft" />
          ) : message.answer ? (
            <AIInsightCard
              title="Answer"
              tone="soft"
              actions={
                message.questionId != null ? (
                  <>
                    <FeedbackButton questionId={message.questionId} positive />
                    <FeedbackButton questionId={message.questionId} positive={false} />
                  </>
                ) : null
              }
            >
              <Markdown>{message.answer}</Markdown>
              {message.sources?.length ? (
                <div className="mt-3 space-y-1.5">
                  {message.sources.slice(0, 4).map((s, i) => (
                    <SourceCitation key={i} source={s} index={i} />
                  ))}
                </div>
              ) : null}
              {message.peopleToAsk?.length ? (
                <div className="mt-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    <Users className="h-3 w-3" /> People to ask
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {message.peopleToAsk.map((p, i) => (
                      <div
                        key={`${p.name}-${i}`}
                        className="flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-2 py-0.5 text-xs"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px]">{getInitials(p.name)}</AvatarFallback>
                        </Avatar>
                        {p.name}
                        {p.role ? <span className="text-[color:var(--color-fg-subtle)]">· {p.role}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </AIInsightCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FeedbackButton({ questionId, positive }: { questionId: ID; positive: boolean }) {
  const [sent, setSent] = React.useState(false);
  const mut = useMutation({
    mutationFn: () =>
      submitAnswerFeedback(questionId, { feedback_type: positive ? "thumbs_up" : "thumbs_down" }),
    onSuccess: () => {
      setSent(true);
      toast.success(positive ? "Thanks — glad it helped" : "Noted — AI will improve");
    },
  });
  const Icon = positive ? ThumbsUp : ThumbsDown;
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={sent || mut.isPending}
      onClick={() => mut.mutate()}
      title={positive ? "Helpful" : "Not helpful"}
    >
      <Icon className={cn("h-3.5 w-3.5", sent && positive && "text-[color:var(--color-success)]")} />
    </Button>
  );
}
