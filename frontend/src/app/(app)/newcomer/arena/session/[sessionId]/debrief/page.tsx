"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Confetti } from "@/components/shared/Confetti";
import { CountUp } from "@/components/shared/CountUp";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { SkillRadar } from "@/components/arena/SkillRadar";
import { TranscriptReview } from "@/components/arena/TranscriptReview";
import { useArenaDebrief } from "@/hooks/use-arena-debrief";

export default function ArenaDebriefPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = Number(params?.sessionId);
  const { data, isLoading } = useArenaDebrief(Number.isFinite(sessionId) ? sessionId : null);
  const shouldCelebrate = !!data && (data.overall_score >= 80 || data.badges.length > 0);

  React.useEffect(() => {
    if (!shouldCelebrate || typeof navigator === "undefined" || !("vibrate" in navigator)) {
      return;
    }
    try {
      navigator.vibrate?.([15, 30, 15]);
    } catch {
      /* no-op */
    }
  }, [shouldCelebrate, data?.session_id]);

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={6} />
      </div>
    );
  }

  const confettiTrigger = shouldCelebrate ? data.session_id : 0;

  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <Confetti trigger={confettiTrigger} />
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/newcomer/arena">
            <ArrowLeft className="h-4 w-4" /> Back to lobby
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-1">
          <Link href={`/newcomer/arena/session/${sessionId}`}>
            Replay session <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
        <AuroraBackground intensity="subtle" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
              Debrief · Session #{data.session_id}
            </div>
            <h1 className="mt-1 text-3xl font-semibold leading-tight text-[color:var(--color-fg)]">
              {data.headline}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--color-fg-muted)]">
              {data.summary}
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-6">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                  Arena Score
                </div>
                <div className="text-5xl font-semibold tabular-nums">
                  <CountUp value={Math.round(data.overall_score)} />
                </div>
              </div>
              {data.strongest_dimension ? (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                    Strongest
                  </div>
                  <div className="text-sm font-medium text-emerald-700">
                    {data.strongest_dimension.replace("_", " ")}
                  </div>
                </div>
              ) : null}
              {data.weakest_dimension ? (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                    To work on
                  </div>
                  <div className="text-sm font-medium text-rose-700">
                    {data.weakest_dimension.replace("_", " ")}
                  </div>
                </div>
              ) : null}
            </div>

            {data.next_step ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] px-3 py-2 text-sm text-[color:var(--color-primary-active)]">
                <Sparkles className="h-4 w-4" />
                Next step — {data.next_step}
              </div>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="mx-auto"
          >
            <SkillRadar scores={data.radar_scores} size={300} />
          </motion.div>
        </div>
      </div>

      {data.badges.length ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
            <Trophy className="h-3.5 w-3.5 text-[color:var(--color-warning)]" /> Badges earned
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.badges.map((badge) => (
              <motion.div
                key={badge.code}
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="ai-gradient flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow"
                title={badge.description ?? ""}
              >
                <span className="text-base">{badge.emoji}</span>
                {badge.label}
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          Full transcript — every line scored. Click a red message for alternatives.
        </div>
        <TranscriptReview transcript={data.transcript} />
      </div>
    </div>
  );
}
