"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb, SendHorizonal, Eye } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getArenaScenario,
  getArenaSession,
  listSessionMessages,
  sendMentorHint,
} from "@/services/arena";
import { useDemo } from "@/providers/demo-provider";
import type { ArenaMessage, ArenaMessageColor } from "@/types";

const POLL_INTERVAL = 4000;

const QUICK_HINTS = [
  "Ask about budget now",
  "Use FEEL–FELT–FOUND",
  "Mirror their last sentence",
  "Quantify the problem",
  "Take the silence — wait",
];

const COLOR_RING: Record<ArenaMessageColor, string> = {
  green: "ring-emerald-400",
  yellow: "ring-amber-400",
  red: "ring-rose-500",
  neutral: "ring-[color:var(--color-border)]",
};

export default function MentorLiveSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = Number(params?.sessionId);
  const { mentorId } = useDemo();

  const sessionQuery = useQuery({
    queryKey: ["arena", "mentor-session", sessionId],
    queryFn: () => getArenaSession(sessionId),
    enabled: Number.isFinite(sessionId),
    refetchInterval: POLL_INTERVAL,
  });
  const scenarioQuery = useQuery({
    queryKey: ["arena", "mentor-scenario", sessionQuery.data?.scenario_id],
    queryFn: () => getArenaScenario(sessionQuery.data!.scenario_id),
    enabled: !!sessionQuery.data?.scenario_id,
  });
  const messagesQuery = useQuery({
    queryKey: ["arena", "mentor-messages", sessionId],
    queryFn: () => listSessionMessages(sessionId),
    enabled: Number.isFinite(sessionId),
    refetchInterval: POLL_INTERVAL,
  });

  const [hint, setHint] = React.useState("");
  const [recentHints, setRecentHints] = React.useState<{ id: number; text: string }[]>([]);

  const hintMut = useMutation({
    mutationFn: (text: string) => sendMentorHint(sessionId, text, mentorId ?? null),
    onSuccess: (_data, text) => {
      setRecentHints((h) => [
        { id: Date.now(), text },
        ...h.slice(0, 4),
      ]);
      setHint("");
    },
  });

  const send = (text: string) => {
    if (!text.trim()) return;
    hintMut.mutate(text.trim());
  };

  const session = sessionQuery.data;
  const scenario = scenarioQuery.data;
  const messages = messagesQuery.data ?? [];
  const sorted = React.useMemo(
    () => [...messages].sort((a, b) => a.order_index - b.order_index),
    [messages],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 -mb-2">
        <Link href="/mentor/arena">
          <ArrowLeft className="h-4 w-4" /> Back to Arena cockpit
        </Link>
      </Button>

      <PageHeader
        eyebrow="Mentor live shadow"
        title={
          <span className="inline-flex items-center gap-2">
            <Eye className="h-4 w-4 text-[color:var(--color-primary)]" />
            Session #{sessionId}
            {scenario ? ` · ${scenario.title}` : ""}
          </span>
        }
        description={
          session?.status === "ended"
            ? "Session ended — transcript below is final."
            : "Read the chat. Send one-line hints. The newcomer can take them or ignore them — no penalty."
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
          {sorted.length === 0 ? (
            <div className="py-10 text-center text-sm text-[color:var(--color-fg-muted)]">
              Waiting for the newcomer to send the first message…
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((m: ArenaMessage) => {
                const color = (m.color as ArenaMessageColor) ?? "neutral";
                const isNewcomer = m.sender === "newcomer";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex w-full",
                      isNewcomer ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                        isNewcomer
                          ? "ring-2 ring-offset-2 ring-offset-[color:var(--color-surface)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                          : "border border-[color:var(--color-border)]",
                        isNewcomer && COLOR_RING[color],
                      )}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                        {isNewcomer ? "newcomer" : "ai client"}
                      </div>
                      <div className="mt-0.5">{m.content}</div>
                      {isNewcomer && m.ai_analysis ? (
                        <div className="mt-1 text-[10px] opacity-90">
                          {(m.ai_analysis as { label?: string }).label ?? ""}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Flash hint
            </div>
            <div className="mt-2 space-y-2">
              <Input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(hint)}
                placeholder="e.g. Ask about budget now"
                disabled={hintMut.isPending || session?.status === "ended"}
              />
              <Button
                variant="ai"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => send(hint)}
                disabled={!hint.trim() || hintMut.isPending || session?.status === "ended"}
              >
                <SendHorizonal className="h-3.5 w-3.5" />
                {hintMut.isPending ? "Sending…" : "Send to newcomer"}
              </Button>
              <div className="pt-2">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                  Quick hints
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_HINTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      disabled={hintMut.isPending || session?.status === "ended"}
                      className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1 text-xs hover:bg-[color:var(--color-surface-muted)] disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
              Sent in this session
            </div>
            <div className="mt-2 space-y-1.5">
              <AnimatePresence initial={false}>
                {recentHints.length === 0 ? (
                  <div className="text-xs text-[color:var(--color-fg-subtle)]">
                    No hints sent yet.
                  </div>
                ) : null}
                {recentHints.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900"
                  >
                    {h.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] p-4 text-xs text-[color:var(--color-primary-active)]">
            Transcript updates every 4s. Hints reach the newcomer instantly via SSE.
          </div>
        </aside>
      </div>
    </div>
  );
}
