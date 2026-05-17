"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BookOpen, ListChecks, Sparkles } from "lucide-react";

import { askAI, getConversation, listConversations } from "@/services/ai";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import { cn } from "@/lib/utils";
import type { AIAskResponse, AIConversation, AIQuestion, ID } from "@/types";

import { AskAIChat, type ChatMessage } from "@/components/newcomer/ask/AskAIChat";
import { ConversationHistoryDrawer } from "@/components/newcomer/ask/ConversationHistoryDrawer";
import { HistoryToggle } from "@/components/newcomer/ask/HistoryToggle";

const SUGGESTED = [
  "Where is the deployment guide?",
  "Who reviews my PR?",
  "How does pointage work?",
  "What does our code review process look like?",
  "How do I run the project locally?",
];

const HISTORY_VISIBLE_KEY = "onbord.ask.historyVisible";

export default function AskAIPage() {
  return (
    <React.Suspense fallback={null}>
      <AskAIPageInner />
    </React.Suspense>
  );
}

function readHistoryVisible(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(HISTORY_VISIBLE_KEY);
  return raw === null ? true : raw === "1";
}

function questionToMessage(q: AIQuestion): ChatMessage {
  return {
    question: q.question,
    questionId: q.id,
    answer: q.answer,
    sources: q.sources,
  };
}

function AskAIPageInner() {
  const search = useSearchParams();
  const qc = useQueryClient();
  const { newcomerId, newcomerName } = useDemo();

  const [historyVisible, setHistoryVisible] = React.useState<boolean>(readHistoryVisible);
  const [activeConversationId, setActiveConversationId] = React.useState<ID | null>(() => {
    const fromUrl = search?.get("conversationId");
    return fromUrl ? Number(fromUrl) : null;
  });
  const [draftMessages, setDraftMessages] = React.useState<ChatMessage[]>([]);

  React.useEffect(() => {
    window.localStorage.setItem(HISTORY_VISIBLE_KEY, historyVisible ? "1" : "0");
  }, [historyVisible]);

  const conversationsQuery = useQuery({
    queryKey: ["ai", "conversations", newcomerId],
    queryFn: () => listConversations({ newcomer_id: newcomerId ?? undefined }),
    enabled: !!newcomerId,
  });

  const activeConversationQuery = useQuery({
    queryKey: ["ai", "conversation", activeConversationId],
    queryFn: () => getConversation(activeConversationId as ID),
    enabled: activeConversationId != null,
  });

  // Hydrate the chat from server data only once per conversation switch so a
  // later refetch (after asking a new question) cannot wipe a pending message.
  const hydratedConvRef = React.useRef<ID | null>(null);
  React.useEffect(() => {
    if (activeConversationId == null) {
      hydratedConvRef.current = null;
      return;
    }
    if (hydratedConvRef.current === activeConversationId) return;
    if (activeConversationQuery.data) {
      setDraftMessages(activeConversationQuery.data.questions.map(questionToMessage));
      hydratedConvRef.current = activeConversationId;
    }
  }, [activeConversationId, activeConversationQuery.data]);

  const askMut = useMutation({
    mutationFn: (question: string) =>
      askAI({
        question,
        newcomer_id: newcomerId ?? undefined,
        top_k: 4,
        conversation_id: activeConversationId ?? undefined,
      }),
  });

  const submit = async (question: string) => {
    if (!question.trim()) return;
    const placeholder: ChatMessage = { question, pending: true };
    setDraftMessages((m) => [...m, placeholder]);
    try {
      const resp: AIAskResponse = await askMut.mutateAsync(question);
      setDraftMessages((m) =>
        m.map((item) =>
          item === placeholder
            ? {
                ...item,
                pending: false,
                answer: resp.answer,
                questionId: resp.question_id,
                sources: resp.sources,
                peopleToAsk: resp.people_to_ask,
              }
            : item,
        ),
      );
      if (resp.conversation_id != null && resp.conversation_id !== activeConversationId) {
        setActiveConversationId(resp.conversation_id);
      }
      qc.invalidateQueries({ queryKey: ["ai", "conversations", newcomerId] });
      if (resp.conversation_id != null) {
        qc.invalidateQueries({ queryKey: ["ai", "conversation", resp.conversation_id] });
      }
    } catch (e) {
      const msg = toApiError(e).message;
      setDraftMessages((m) =>
        m.map((item) => (item === placeholder ? { ...item, pending: false, errored: msg } : item)),
      );
      toast.error("AI couldn't answer", { description: msg });
    }
  };

  // Auto-submit ?q= once on first mount when no conversation is active.
  const didAutoSubmit = React.useRef(false);
  React.useEffect(() => {
    if (didAutoSubmit.current) return;
    const q = search?.get("q");
    if (q && activeConversationId == null) {
      didAutoSubmit.current = true;
      const timer = window.setTimeout(() => void submit(q), 0);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewChat = () => {
    hydratedConvRef.current = null;
    setActiveConversationId(null);
    setDraftMessages([]);
  };

  const handleSelectConversation = (id: ID) => {
    if (id === activeConversationId) return;
    hydratedConvRef.current = null;
    setActiveConversationId(id);
    setDraftMessages([]); // will be repopulated by the effect when data arrives
  };

  const activeConversation: AIConversation | undefined =
    activeConversationQuery.data ??
    conversationsQuery.data?.find((c) => c.id === activeConversationId);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full overflow-hidden">
      {historyVisible ? (
        <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30">
          <div className="border-b border-[color:var(--color-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg ai-gradient text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="text-sm font-semibold">Conversations</div>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <ConversationHistoryDrawer
              conversations={conversationsQuery.data}
              isLoading={conversationsQuery.isLoading}
              activeConversationId={activeConversationId}
              onSelect={handleSelectConversation}
              onNew={handleNewChat}
              newcomerId={newcomerId}
            />
          </div>
        </aside>
      ) : null}

      <section className={cn("flex min-w-0 flex-1 flex-col", !historyVisible && "mx-auto max-w-screen-xl w-full")}>
        <header className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] bg-white px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
              Ask AI
            </div>
            <h1 className="truncate text-sm font-semibold sm:text-base">
              {activeConversation?.title ?? "Your team's knowledge, on tap"}
            </h1>
          </div>
          <HistoryToggle visible={historyVisible} onToggle={() => setHistoryVisible((v) => !v)} />
        </header>

        <div className="min-h-0 flex-1">
          <AskAIChat
            messages={draftMessages}
            newcomerName={newcomerName}
            suggestions={SUGGESTED}
            isSubmitting={askMut.isPending}
            onSubmit={submit}
            contextBanner={
              activeConversation?.context_type && activeConversation?.context_id != null ? (
                <ConversationContextBanner
                  type={activeConversation.context_type}
                  id={activeConversation.context_id}
                />
              ) : null
            }
          />
        </div>
      </section>
    </div>
  );
}

function ConversationContextBanner({ type, id }: { type: "document" | "task"; id: ID }) {
  const Icon = type === "document" ? BookOpen : ListChecks;
  const href = type === "document" ? `/newcomer/knowledge/${id}` : `/newcomer/tasks/${id}`;
  const label = type === "document" ? "Started from a document" : "Started from a task";

  return (
    <Link
      href={href}
      className="mx-auto flex max-w-3xl items-center gap-2 rounded-lg border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)]/40 px-3 py-2 text-xs text-[color:var(--color-primary-active)] hover:bg-[color:var(--color-primary-soft)]"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-[color:var(--color-fg-subtle)]">Open ↗</span>
    </Link>
  );
}
