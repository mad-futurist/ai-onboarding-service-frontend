"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Send, Lightbulb, Users, ThumbsUp, ThumbsDown } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { SourceCitation } from "@/components/ai/SourceCitation";
import { Skeleton } from "@/components/ui/skeleton";

import { askAI, submitAnswerFeedback } from "@/services/ai";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import { getInitials, cn } from "@/lib/utils";
import type { AIAskResponse } from "@/types";

const SUGGESTED = [
  "Where is the deployment guide?",
  "Who reviews my PR?",
  "How does pointage work?",
  "What does our code review process look like?",
  "How do I run the project locally?",
];

interface ChatItem {
  question: string;
  response?: AIAskResponse;
  pending?: boolean;
  errored?: string;
}

export default function AskAIPage() {
  const search = useSearchParams();
  const { newcomerId, newcomerName } = useDemo();
  const [draft, setDraft] = React.useState(search?.get("q") ?? "");
  const [chat, setChat] = React.useState<ChatItem[]>([]);

  const askMut = useMutation({
    mutationFn: (question: string) =>
      askAI({ question, newcomer_id: newcomerId ?? undefined, top_k: 4 }),
  });

  const submit = async (question: string) => {
    if (!question.trim()) return;
    const placeholder: ChatItem = { question, pending: true };
    setChat((c) => [...c, placeholder]);
    setDraft("");
    try {
      const resp = await askMut.mutateAsync(question);
      setChat((c) => c.map((m) => (m === placeholder ? { ...m, pending: false, response: resp } : m)));
    } catch (e) {
      const msg = toApiError(e).message;
      setChat((c) => c.map((m) => (m === placeholder ? { ...m, pending: false, errored: msg } : m)));
      toast.error("AI couldn't answer", { description: msg });
    }
  };

  // Auto-submit if ?q= present
  React.useEffect(() => {
    const q = search?.get("q");
    if (q && chat.length === 0) {
      void submit(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(draft);
  };

  const lastSources = chat[chat.length - 1]?.response?.sources;
  const lastFollowups = chat[chat.length - 1]?.response?.follow_up_questions;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Ask AI"
        title="Your team's knowledge, on tap"
        description="Grounded in your company docs. Every answer cites its sources and who to ask next."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {chat.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl ai-gradient text-white shadow-[var(--shadow-ai)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Start the conversation</div>
                    <div className="text-xs text-[color:var(--color-fg-muted)]">
                      Try one of the suggestions or ask anything.
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {SUGGESTED.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void submit(q)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-left text-sm text-[color:var(--color-fg)] hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/40"
                    >
                      <span className="truncate">{q}</span>
                      <Send className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="space-y-5">
            {chat.map((msg, idx) => (
              <ChatMessage key={idx} item={msg} name={newcomerName} />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="sticky bottom-4 z-10">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-2 shadow-[var(--shadow-elevated)]">
              <div className="ai-border rounded-xl">
                <Textarea
                  rows={2}
                  placeholder="Ask anything about your team, processes, docs…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void submit(draft);
                    }
                  }}
                  className="border-0 shadow-none focus-visible:ring-0 rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-2 pt-2">
                <span className="text-[11px] text-[color:var(--color-fg-subtle)]">
                  Press Enter to send · Shift+Enter for newline
                </span>
                <Button type="submit" variant="ai" size="sm" disabled={!draft.trim() || askMut.isPending}>
                  <Send className="h-3.5 w-3.5" /> Ask AI
                </Button>
              </div>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" /> Sources used
              </CardTitle>
              <CardDescription>
                {lastSources?.length ? "From your most recent answer." : "Sources will show here after you ask something."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {lastSources?.length ? (
                lastSources.map((s, i) => <SourceCitation key={i} source={s} index={i} />)
              ) : (
                <div className="text-xs text-[color:var(--color-fg-muted)]">No sources yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[color:var(--color-primary)]" /> Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {(lastFollowups ?? SUGGESTED.slice(0, 4)).map((q) => (
                <button
                  key={q}
                  onClick={() => void submit(q)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-muted)]"
                >
                  <span className="truncate">{q}</span>
                  <Send className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ChatMessage({ item, name }: { item: ChatItem; name: string }) {
  return (
    <div className="space-y-3">
      {/* User question */}
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-2xl rounded-tl-md bg-[color:var(--color-surface-muted)] p-3 text-sm text-[color:var(--color-fg)]">
          {item.question}
        </div>
      </div>
      {/* AI reply */}
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full ai-gradient text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          {item.pending ? (
            <AIInsightCard title="Thinking…" tone="soft">
              <div className="space-y-2">
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </AIInsightCard>
          ) : item.errored ? (
            <AIInsightCard title="Something went wrong" description={item.errored} tone="soft" />
          ) : item.response ? (
            <AIInsightCard
              title="Answer"
              tone="soft"
              actions={
                <>
                  <FeedbackButton questionId={item.response.question_id} positive />
                  <FeedbackButton questionId={item.response.question_id} positive={false} />
                </>
              }
            >
              <div
                className={cn(
                  "whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]",
                )}
              >
                {item.response.answer}
              </div>
              {item.response.sources?.length ? (
                <div className="mt-3 space-y-1.5">
                  {item.response.sources.slice(0, 3).map((s, i) => (
                    <SourceCitation key={i} source={s} index={i} />
                  ))}
                </div>
              ) : null}
              {item.response.people_to_ask?.length ? (
                <div className="mt-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    <Users className="h-3 w-3" /> People to ask
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {item.response.people_to_ask.map((p, i) => (
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

function FeedbackButton({ questionId, positive }: { questionId: number; positive: boolean }) {
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
