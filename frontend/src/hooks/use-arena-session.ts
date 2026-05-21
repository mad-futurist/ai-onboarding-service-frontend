"use client";

import * as React from "react";

import { listSessionMessages } from "@/services/arena";
import { openArenaTurnStream, openHintStream } from "@/services/arena-stream";
import type {
  ArenaAnalysisFrame,
  ArenaHintEvent,
  ArenaMessageColor,
  ArenaStreamEvent,
  ID,
} from "@/types";

export interface ChatTurn {
  id: number;
  tempId?: string;
  sender: "newcomer" | "client";
  content: string;
  color?: ArenaMessageColor;
  label?: string;
  streaming?: boolean;
}

export interface ActiveHint {
  id: number;
  text: string;
  createdAt: number;
}

export interface ArenaSessionState {
  turns: ChatTurn[];
  isStreaming: boolean;
  liveScore: number;
  scoreLog: ArenaAnalysisFrame[];
  hints: ActiveHint[];
  sendMessage: (message: string) => void;
  dismissHint: (hintId: number) => void;
}

const HINT_TTL_MS = 5000;

export function useArenaSession(sessionId: ID | null): ArenaSessionState {
  const [turns, setTurns] = React.useState<ChatTurn[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [scoreLog, setScoreLog] = React.useState<ArenaAnalysisFrame[]>([]);
  const [hints, setHints] = React.useState<ActiveHint[]>([]);

  const streamHandleRef = React.useRef<{ close(): void } | null>(null);
  const hintHandleRef = React.useRef<{ close(): void } | null>(null);
  const hintCounterRef = React.useRef(0);

  // Bootstrap: fetch existing messages on mount
  React.useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    listSessionMessages(sessionId)
      .then((msgs) => {
        if (cancelled) return;
        setTurns(
          msgs
            .filter((m) => m.sender === "newcomer" || m.sender === "client")
            .map((m) => ({
              id: m.id,
              sender: (m.sender === "client" ? "client" : "newcomer"),
              content: m.content,
              color: (m.color ?? undefined) as ArenaMessageColor | undefined,
              label: (m.ai_analysis as { label?: string } | null)?.label,
            })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Hint stream lifecycle
  React.useEffect(() => {
    if (!sessionId) return;
    const handle = openHintStream(sessionId, (event: ArenaHintEvent) => {
      if (event.type !== "hint") return;
      const hint: ActiveHint = {
        id: ++hintCounterRef.current,
        text: event.text,
        createdAt: Date.now(),
      };
      setHints((h) => [...h, hint]);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.(15);
        } catch {
          /* no-op */
        }
      }
      window.setTimeout(() => {
        setHints((h) => h.filter((x) => x.id !== hint.id));
      }, HINT_TTL_MS);
    });
    hintHandleRef.current = handle;
    return () => {
      handle.close();
      hintHandleRef.current = null;
    };
  }, [sessionId]);

  const dismissHint = React.useCallback((hintId: number) => {
    setHints((h) => h.filter((x) => x.id !== hintId));
  }, []);

  const sendMessage = React.useCallback(
    (raw: string) => {
      const message = raw.trim();
      if (!message || !sessionId || isStreaming) return;

      const tempId = `local-${Date.now()}`;
      const aiTempId = `assistant-${Date.now()}`;
      setTurns((t) => [
        ...t,
        { id: -1, tempId, sender: "newcomer", content: message },
        { id: -2, tempId: aiTempId, sender: "client", content: "", streaming: true },
      ]);
      setIsStreaming(true);

      const handle = openArenaTurnStream(sessionId, message, (event: ArenaStreamEvent) => {
        if (event.type === "user_saved") {
          setTurns((t) =>
            t.map((turn) => (turn.tempId === tempId ? { ...turn, id: event.messageId } : turn)),
          );
        } else if (event.type === "token") {
          setTurns((t) =>
            t.map((turn) =>
              turn.tempId === aiTempId ? { ...turn, content: turn.content + event.delta } : turn,
            ),
          );
        } else if (event.type === "analysis") {
          const frame: ArenaAnalysisFrame = {
            messageId: event.messageId,
            dimension: event.dimension,
            delta: event.delta,
            label: event.label,
            color: event.color,
            why: event.why,
          };
          setScoreLog((log) => [...log, frame]);
          setTurns((t) =>
            t.map((turn) =>
              turn.id === event.messageId
                ? { ...turn, color: event.color, label: event.label }
                : turn,
            ),
          );
          if (
            event.color === "red" &&
            typeof navigator !== "undefined" &&
            "vibrate" in navigator
          ) {
            try {
              navigator.vibrate?.(25);
            } catch {
              /* no-op */
            }
          }
        } else if (event.type === "done") {
          setTurns((t) =>
            t
              .map((turn) =>
                turn.tempId === aiTempId
                  ? {
                      ...turn,
                      id: event.aiMessageId ?? turn.id,
                      streaming: false,
                    }
                  : turn,
              )
              .filter((turn) => turn.sender !== "client" || turn.content.trim().length > 0),
          );
          setIsStreaming(false);
          handle.close();
          streamHandleRef.current = null;
        } else if (event.type === "error") {
          setTurns((t) =>
            t.map((turn) =>
              turn.tempId === aiTempId
                ? { ...turn, content: turn.content || "(connection error)", streaming: false }
                : turn,
            ),
          );
          setIsStreaming(false);
          handle.close();
          streamHandleRef.current = null;
        }
      });

      streamHandleRef.current = handle;
    },
    [sessionId, isStreaming],
  );

  React.useEffect(() => {
    return () => {
      streamHandleRef.current?.close();
      hintHandleRef.current?.close();
    };
  }, []);

  const liveScore = React.useMemo(() => {
    if (!scoreLog.length) return 50;
    const total = scoreLog.reduce((acc, frame) => acc + frame.delta, 0);
    return Math.max(0, Math.min(100, 50 + total));
  }, [scoreLog]);

  return {
    turns,
    isStreaming,
    liveScore,
    scoreLog,
    hints,
    sendMessage,
    dismissHint,
  };
}
