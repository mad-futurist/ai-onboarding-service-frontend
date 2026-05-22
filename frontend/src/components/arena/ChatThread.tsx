"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { coachArenaMessage } from "@/services/arena";
import type {
  ArenaMessageColor,
  ArenaMessageCoach,
  ArenaPersonaDefinition,
  ID,
} from "@/types";
import { MessageCoachPanel } from "@/components/arena/MessageCoachPanel";
import type { ChatTurn } from "@/hooks/use-arena-session";

const COLOR_RING: Record<ArenaMessageColor, string> = {
  green: "ring-2 ring-emerald-400/50",
  yellow: "ring-2 ring-amber-400/50",
  red: "ring-2 ring-rose-500/60",
  neutral: "ring-1 ring-[color:var(--color-border)]",
};

function TypingDots() {
  return (
    <div className="flex gap-1 px-2 py-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-fg-muted)]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

interface CoachState {
  loading: boolean;
  data: ArenaMessageCoach | null;
}

interface ChatThreadProps {
  turns: ChatTurn[];
  persona?: ArenaPersonaDefinition | null;
}

export function ChatThread({ turns, persona }: ChatThreadProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [openCoachId, setOpenCoachId] = React.useState<ID | null>(null);
  const [coachState, setCoachState] = React.useState<Record<number, CoachState>>({});
  const lastTurnContentLength = turns[turns.length - 1]?.content?.length ?? 0;

  const coachMut = useMutation({
    mutationFn: (messageId: ID) => coachArenaMessage(messageId),
  });

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns.length, lastTurnContentLength]);

  const requestCoach = (messageId: ID) => {
    if (messageId <= 0) return;
    if (openCoachId === messageId) {
      setOpenCoachId(null);
      return;
    }
    setOpenCoachId(messageId);
    if (coachState[messageId]?.data) {
      return;
    }
    setCoachState((s) => ({ ...s, [messageId]: { loading: true, data: null } }));
    coachMut.mutate(messageId, {
      onSuccess: (data) => {
        setCoachState((s) => ({ ...s, [messageId]: { loading: false, data } }));
      },
      onError: () => {
        setCoachState((s) => ({ ...s, [messageId]: { loading: false, data: null } }));
      },
    });
  };

  if (turns.length === 0) {
    return (
      <div
        ref={scrollRef}
        className="flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-6 text-center"
      >
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-5 text-sm text-[color:var(--color-fg-muted)]">
          <div className="text-base font-semibold text-[color:var(--color-fg)]">
            Open the call
          </div>
          <p className="mt-1 max-w-sm">
            {persona ? (
              <>
                You&rsquo;re talking to <b>{persona.name}</b>
                {persona.role ? `, ${persona.role}` : ""}
                {persona.company ? ` at ${persona.company}` : ""}.
              </>
            ) : (
              <>Greet the client and start when ready.</>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-6"
    >
      {turns.map((turn, idx) => {
        const key = turn.tempId ?? `m-${turn.id}-${idx}`;
        const isNewcomer = turn.sender === "newcomer";
        const color: ArenaMessageColor = (turn.color as ArenaMessageColor) || "neutral";
        const canCoach = !turn.streaming && turn.id > 0;
        const isOpen = openCoachId === turn.id;
        const state = coachState[turn.id];

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="flex w-full flex-col"
          >
            <div
              className={cn(
                "group flex w-full items-start gap-2",
                isNewcomer ? "justify-end" : "justify-start",
              )}
            >
              {!isNewcomer && canCoach ? (
                <CoachTrigger
                  side="right"
                  active={isOpen}
                  onClick={() => requestCoach(turn.id)}
                />
              ) : null}

              <div
                className={cn(
                  "relative max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                  isNewcomer
                    ? cn(
                        "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]",
                        COLOR_RING[color],
                      )
                    : "bg-[color:var(--color-surface)] text-[color:var(--color-fg)] border border-[color:var(--color-border)]",
                )}
              >
                {turn.content || (turn.streaming ? <TypingDots /> : null)}
                {turn.label && isNewcomer ? (
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/95">
                    {turn.label}
                  </div>
                ) : null}
              </div>

              {isNewcomer && canCoach ? (
                <CoachTrigger
                  side="left"
                  active={isOpen}
                  onClick={() => requestCoach(turn.id)}
                />
              ) : null}
            </div>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <MessageCoachPanel
                  key={`coach-${turn.id}`}
                  loading={!!state?.loading}
                  data={state?.data ?? null}
                  isSelf={isNewcomer}
                />
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function CoachTrigger({
  side,
  active,
  onClick,
}: {
  side: "left" | "right";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-demo-id="arena-message-coach"
      title="AI coach insight"
      className={cn(
        "mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-transparent text-[color:var(--color-fg-muted)] opacity-0 transition-all hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-ring)]",
        active &&
          "opacity-100 border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]",
        side === "left" ? "order-last" : "order-first",
      )}
      aria-label="Show AI coach for this message"
    >
      {active ? <Sparkles className="h-3.5 w-3.5" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
    </button>
  );
}
