"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Send, Sparkles, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { SourceCitation } from "@/components/ai/SourceCitation";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemo } from "@/providers/demo-provider";
import { toApiError } from "@/lib/api";
import { askAboutDocument } from "@/services/newcomer-kb";
import { getInitials } from "@/lib/utils";
import type { AIAskResponse, ID, NewcomerDocument } from "@/types";

interface ChatItem {
  question: string;
  response?: AIAskResponse;
  pending?: boolean;
  errored?: string;
}

interface DocumentChatPanelProps {
  doc: NewcomerDocument;
}

function buildSuggestions(doc: NewcomerDocument): string[] {
  const t = doc.title;
  return [
    `Résume-moi "${t}" en 3 points.`,
    `Quels sont les points clés de ce document ?`,
    `Comment puis-je appliquer ça à mon rôle ?`,
    `Y a-t-il des actions ou check-lists à retenir ?`,
  ];
}

export function DocumentChatPanel({ doc }: DocumentChatPanelProps) {
  const { newcomerId, newcomerName } = useDemo();
  const reduced = useReducedMotion();
  const [draft, setDraft] = React.useState("");
  const [chat, setChat] = React.useState<ChatItem[]>([]);

  const askMut = useMutation({
    mutationFn: (question: string) =>
      askAboutDocument(newcomerId as ID, doc.id, question),
  });

  const submit = async (question: string) => {
    if (!question.trim() || !newcomerId) return;
    const placeholder: ChatItem = { question, pending: true };
    setChat((c) => [...c, placeholder]);
    setDraft("");
    try {
      const resp = await askMut.mutateAsync(question);
      setChat((c) =>
        c.map((m) => (m === placeholder ? { ...m, pending: false, response: resp } : m)),
      );
    } catch (e) {
      const msg = toApiError(e).message;
      setChat((c) =>
        c.map((m) => (m === placeholder ? { ...m, pending: false, errored: msg } : m)),
      );
      toast.error("AI couldn't answer", { description: msg });
    }
  };

  const suggestions = React.useMemo(() => buildSuggestions(doc), [doc]);
  const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <div className="space-y-4">
      {chat.length === 0 ? (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easing }}
          className="ai-border rounded-2xl"
        >
          <div className="rounded-2xl bg-white p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl ai-gradient text-white shadow-[var(--shadow-ai)]">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Ask this document anything</div>
                <div className="text-xs text-[color:var(--color-fg-muted)]">
                  Answers are grounded in this document and your knowledge base.
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void submit(q)}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-left text-sm transition-colors hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/40"
                >
                  <span className="truncate">{q}</span>
                  <Send className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}

      <div className="space-y-5">
        <AnimatePresence initial={false}>
          {chat.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: easing }}
            >
              <ChatMessage item={msg} name={newcomerName} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(draft);
        }}
        className="sticky bottom-4 z-10"
      >
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-2 shadow-[var(--shadow-elevated)]">
          <div className="ai-border rounded-xl">
            <Textarea
              rows={2}
              placeholder={`Pose une question sur "${doc.title}"…`}
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
            <Button
              type="submit"
              variant="ai"
              size="sm"
              disabled={!draft.trim() || askMut.isPending}
            >
              <Send className="h-3.5 w-3.5" /> Ask
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ChatMessage({ item, name }: { item: ChatItem; name: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-2xl rounded-tl-md bg-[color:var(--color-surface-muted)] p-3 text-sm text-[color:var(--color-fg)]">
          {item.question}
        </div>
      </div>
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
            <AIInsightCard title="Answer" tone="soft">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
                {item.response.answer}
              </div>
              {item.response.sources?.length ? (
                <div className="mt-3 space-y-1.5">
                  {item.response.sources.slice(0, 3).map((s, i) => (
                    <SourceCitation key={i} source={s} index={i} />
                  ))}
                </div>
              ) : null}
            </AIInsightCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
