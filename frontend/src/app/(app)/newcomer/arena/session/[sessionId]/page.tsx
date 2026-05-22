"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatThread } from "@/components/arena/ChatThread";
import { NewcomerInputBar } from "@/components/arena/NewcomerInputBar";
import { SessionTimer } from "@/components/arena/SessionTimer";
import { LiveAnalysisPanel } from "@/components/arena/LiveAnalysisPanel";
import { MentorHintToast } from "@/components/arena/MentorHintToast";
import { useArenaSession } from "@/hooks/use-arena-session";
import {
  endArenaSession,
  getArenaScenario,
  getArenaSession,
} from "@/services/arena";

export default function SimulationChatPage() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const sessionId = Number(params?.sessionId);

  const sessionQuery = useQuery({
    queryKey: ["arena", "session", sessionId],
    queryFn: () => getArenaSession(sessionId),
    enabled: Number.isFinite(sessionId),
  });
  const scenarioQuery = useQuery({
    queryKey: ["arena", "scenario", sessionQuery.data?.scenario_id],
    queryFn: () => getArenaScenario(sessionQuery.data!.scenario_id),
    enabled: !!sessionQuery.data?.scenario_id,
  });

  const session = sessionQuery.data;
  const scenario = scenarioQuery.data;
  const ended = session?.status === "ended";

  const chat = useArenaSession(Number.isFinite(sessionId) ? sessionId : null);

  const endMut = useMutation({
    mutationFn: async () => {
      return await endArenaSession(sessionId);
    },
    onSuccess: () => {
      router.push(`/newcomer/arena/session/${sessionId}/debrief`);
    },
  });

  const openDebrief = React.useCallback(() => {
    router.push(`/newcomer/arena/session/${sessionId}/debrief`);
  }, [router, sessionId]);

  const handleEnd = React.useCallback(() => {
    if (ended) {
      openDebrief();
      return;
    }
    if (!endMut.isPending && Number.isFinite(sessionId)) {
      endMut.mutate();
    }
  }, [endMut, ended, openDebrief, sessionId]);

  return (
    <div
      className="mx-auto flex h-[calc(100vh-6rem)] max-w-7xl flex-col gap-3 overflow-hidden px-4 py-4 sm:px-6 lg:h-[calc(100vh-7rem)]"
      data-demo-id="arena-session-page"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/newcomer/arena" aria-label="Back to lobby">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
              Arena · live simulation
            </div>
            <div className="text-lg font-semibold leading-tight">
              {scenario?.title ?? "Loading…"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session ? <SessionTimer startedAt={session.started_at} /> : null}
          {scenario ? (
            <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[11px] font-semibold tracking-wide">
              Difficulty {scenario.difficulty}/5
            </span>
          ) : null}
          <Button
            variant="ai"
            size="sm"
            onClick={handleEnd}
            disabled={endMut.isPending}
            className="gap-1.5"
            data-demo-id="arena-session-end"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {endMut.isPending ? "Generating debrief…" : ended ? "Open debrief" : "End & debrief"}
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] lg:grid lg:grid-cols-[1fr_340px]">
        <MentorHintToast hints={chat.hints} onDismiss={chat.dismissHint} />

        <div className="flex min-h-0 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatThread turns={chat.turns} persona={scenario?.persona ?? null} />
          </div>
          <NewcomerInputBar
            onSend={chat.sendMessage}
            onEnd={handleEnd}
            isStreaming={chat.isStreaming}
            disabled={ended}
            endDisabled={endMut.isPending}
            endLabel={ended ? "Open debrief" : "End session"}
          />
        </div>

        <div className="min-h-0 overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40 lg:border-l lg:border-t-0">
          <LiveAnalysisPanel
            scenario={scenario ?? null}
            sessionId={sessionId}
            liveScore={chat.liveScore}
            scoreLog={chat.scoreLog}
            isStreaming={chat.isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
