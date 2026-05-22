"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/PageHeader";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { CountUp } from "@/components/shared/CountUp";
import { PersonaCard } from "@/components/arena/PersonaCard";
import { PersonalBotTile } from "@/components/arena/PersonalBotTile";
import { LeaderboardStrip } from "@/components/arena/LeaderboardStrip";
import { StreakBadge } from "@/components/arena/StreakBadge";
import { PersonalBotModal } from "@/components/arena/PersonalBotModal";
import { useArenaLobby } from "@/hooks/use-arena-lobby";
import { startArenaSession } from "@/services/arena";
import { useDemo } from "@/providers/demo-provider";
import type { ArenaScenario, ID } from "@/types";

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
  },
};

export default function ArenaLobbyPage() {
  const router = useRouter();
  const { newcomerId, newcomerName } = useDemo();
  const { scenarios, summary, leaderboard, isLoading } = useArenaLobby(newcomerId);
  const [botOpen, setBotOpen] = React.useState(false);

  const startMut = useMutation({
    mutationFn: async (scenario: ArenaScenario) => {
      if (!newcomerId) throw new Error("newcomer missing");
      const session = await startArenaSession(scenario.id, newcomerId);
      return { session, scenario };
    },
    onSuccess: ({ session }) => {
      router.push(`/newcomer/arena/session/${session.id}`);
    },
  });

  const onEnter = (scenario: ArenaScenario) => {
    if (scenario.locked) return;
    startMut.mutate(scenario);
  };

  if (!newcomerId) {
    return (
      <EmptyState
        icon={Swords}
        title="Choose a newcomer to enter the Arena"
        description="Pick a newcomer persona from the top bar."
      />
    );
  }

  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6"
      data-demo-id="arena-lobby-page"
    >
      <PageHeader
        eyebrow="Customer Training Arena"
        title={
          <span>
            Welcome to the Arena, {newcomerName.split(" ")[0]}
          </span>
        }
        description="Pick a client. Talk to them. Every word is scored, then coached."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StreakBadge
              streak={summary?.streak ?? 0}
              sessionsPlayed={summary?.sessions_played ?? 0}
            />
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                Arena Score
              </div>
              <div className="mt-1 text-2xl font-semibold leading-none tabular-nums">
                <CountUp value={Math.round(summary?.overall_score ?? 0)} suffix="" />
              </div>
              <div className="mt-1 text-[11px] text-[color:var(--color-fg-subtle)]">
                Average across all sessions
              </div>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                Last session
              </div>
              <div className="mt-1 text-2xl font-semibold leading-none tabular-nums">
                {summary?.last_session_score != null
                  ? Math.round(summary.last_session_score)
                  : "—"}
              </div>
              <div className="mt-1 text-[11px] text-[color:var(--color-fg-subtle)]">
                {summary?.last_session_score != null
                  ? "Score on most recent attempt"
                  : "No attempts yet"}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : scenarios.length === 0 ? (
            <EmptyState
              icon={Swords}
              title="No scenarios yet"
              description="Ask your mentor to publish a scenario, or forge a Personal Bot below."
            />
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {scenarios.map((scenario) => (
                <motion.div key={scenario.id} variants={itemVariants}>
                  <PersonaCard scenario={scenario} onEnter={() => onEnter(scenario)} />
                </motion.div>
              ))}
              <motion.div variants={itemVariants}>
                <PersonalBotTile onCreate={() => setBotOpen(true)} />
              </motion.div>
            </motion.div>
          )}
        </div>

        <aside className="space-y-4">
          <LeaderboardStrip entries={leaderboard} highlightNewcomerId={newcomerId} />
          <div className="rounded-2xl border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] p-4 text-sm text-[color:var(--color-primary-active)]">
            <div className="text-[11px] font-semibold uppercase tracking-wider">
              How scoring works
            </div>
            <p className="mt-1 text-[13px]">
              Each message you send is silently judged across five dimensions: Opening,
              Discovery, Objections, Closing, Product Knowledge. Red means missed
              opportunity. Click any red message after the session to see better answers.
            </p>
          </div>
        </aside>
      </div>

      {newcomerId ? (
        <PersonalBotModal
          open={botOpen}
          onClose={() => setBotOpen(false)}
          newcomerId={newcomerId as ID}
        />
      ) : null}
    </div>
  );
}
