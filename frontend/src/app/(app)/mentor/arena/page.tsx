"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Swords,
  TrendingDown,
  Trophy,
  Plus,
  AlertCircle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { CountUp } from "@/components/shared/CountUp";
import { LeaderboardStrip } from "@/components/arena/LeaderboardStrip";
import { SkillRadar } from "@/components/arena/SkillRadar";
import { useArenaDashboard } from "@/hooks/use-arena-dashboard";
import { useDemo } from "@/providers/demo-provider";
import type { ArenaRadarScores } from "@/types";

const DIMENSION_LABEL: Record<string, string> = {
  opening: "Opening",
  discovery: "Discovery",
  objections: "Objections",
  closing: "Closing",
  product_knowledge: "Product",
};

export default function MentorArenaDashboardPage() {
  const { mentorId } = useDemo();
  const { data, isLoading } = useArenaDashboard(mentorId);

  if (!mentorId) {
    return (
      <EmptyState
        icon={Swords}
        title="Select a mentor"
        description="Pick a mentor persona from the top bar."
      />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <CardSkeleton rows={3} />
        <CardSkeleton rows={5} />
      </div>
    );
  }

  const radarFromAverages: ArenaRadarScores = {
    opening: Math.round(data.dimension_averages.opening ?? 0),
    discovery: Math.round(data.dimension_averages.discovery ?? 0),
    objections: Math.round(data.dimension_averages.objections ?? 0),
    closing: Math.round(data.dimension_averages.closing ?? 0),
    product_knowledge: Math.round(data.dimension_averages.product_knowledge ?? 0),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <PageHeader
        eyebrow="Customer Training Arena"
        title="Arena cockpit"
        description="See how your newcomers are sparring with AI clients — and where the cohort is bleeding."
        actions={
          <Button asChild variant="ai" size="sm" className="gap-1.5">
            <Link href="/mentor/arena/scenarios/new">
              <Plus className="h-3.5 w-3.5" /> New scenario
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
            Sessions this week
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">
            <CountUp value={data.sessions_this_week} />
          </div>
        </div>
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
            Average score
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">
            <CountUp value={Math.round(data.avg_score)} />
          </div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
            <TrendingDown className="h-3 w-3" /> Weakest cohort dimension
          </div>
          <div className="mt-1 text-xl font-semibold capitalize">
            {data.weakest_team_dimension?.replace("_", " ") ?? "—"}
          </div>
          <div className="mt-1 text-xs text-rose-700">
            Across all ended Arena sessions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
            <Trophy className="h-3.5 w-3.5 text-[color:var(--color-warning)]" />
            Cohort radar
          </div>
          <div className="mt-3 grid items-center gap-4 sm:grid-cols-[300px_1fr]">
            <SkillRadar scores={radarFromAverages} size={280} />
            <div className="space-y-2">
              {Object.entries(radarFromAverages).map(([dim, value]) => (
                <div key={dim} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-[color:var(--color-fg-muted)]">
                    {DIMENSION_LABEL[dim] ?? dim}
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
                      animate={{ width: `${value}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs font-semibold tabular-nums">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <LeaderboardStrip entries={data.leaderboard} />
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              <AlertCircle className="h-3.5 w-3.5" /> Flagged newcomers
            </div>
            {data.flagged_newcomer_ids.length === 0 ? (
              <p className="mt-2 text-xs text-amber-800">
                No one is currently flagged. Auto-flag triggers after 3 low sessions on a dimension.
              </p>
            ) : (
              <p className="mt-2 text-xs text-amber-800">
                {data.flagged_newcomer_ids.length} newcomer
                {data.flagged_newcomer_ids.length === 1 ? "" : "s"} have 3+ weak
                sessions on the same dimension. Check Signals Center for details.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          Recent sessions
        </div>
        {data.recent_sessions.length === 0 ? (
          <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">
            No sessions yet. Publish a scenario and your newcomers will see it in their Arena lobby.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-[color:var(--color-border)]">
            {data.recent_sessions.map((s) => (
              <Link
                key={s.id}
                href={`/mentor/arena/sessions/${s.id}`}
                className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-[color:var(--color-surface-muted)] -mx-2 px-2 rounded-md"
              >
                <div>
                  <div className="font-medium">Session #{s.id}</div>
                  <div className="text-xs text-[color:var(--color-fg-muted)]">
                    {s.status === "ended" ? "Completed" : "In progress"} ·{" "}
                    {new Date(s.started_at).toLocaleString()}
                  </div>
                </div>
                <div className="tabular-nums text-base font-semibold">
                  {s.overall_score != null ? Math.round(s.overall_score) : "—"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
