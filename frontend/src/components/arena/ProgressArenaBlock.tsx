"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Swords, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/shared/CountUp";
import { SkillRadar } from "@/components/arena/SkillRadar";
import { getNewcomerArenaSummary } from "@/services/arena";
import type { ID } from "@/types";

interface ProgressArenaBlockProps {
  newcomerId: ID | null;
}

export function ProgressArenaBlock({ newcomerId }: ProgressArenaBlockProps) {
  const { data } = useQuery({
    queryKey: ["arena", "progress-block", newcomerId],
    queryFn: () => getNewcomerArenaSummary(newcomerId!),
    enabled: newcomerId !== null,
    retry: false,
  });

  if (!data) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
              Customer Training Arena
            </div>
            <div className="mt-1 text-base font-semibold">No sessions yet</div>
            <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
              Practice real client conversations with AI personas. Every line is scored and coached.
            </p>
          </div>
          <Button asChild variant="ai" size="sm" className="gap-1.5">
            <Link href="/newcomer/arena">
              <Swords className="h-3.5 w-3.5" /> Enter Arena
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
            Customer Training Arena
          </div>
          <div className="mt-1 flex items-end gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                Arena Score
              </div>
              <div className="text-4xl font-semibold tabular-nums">
                <CountUp value={Math.round(data.overall_score)} />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                Sessions
              </div>
              <div className="text-2xl font-semibold tabular-nums">
                {data.sessions_played}
              </div>
            </div>
            {data.streak > 0 ? (
              <div className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-semibold text-orange-600">
                <Flame className="h-3 w-3" /> {data.streak} streak
              </div>
            ) : null}
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/newcomer/arena">
            <Swords className="h-3.5 w-3.5" /> Open Arena
          </Link>
        </Button>
      </div>

      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[240px_1fr]">
        <SkillRadar scores={data.radar_scores} size={220} showValues={false} />
        <div className="space-y-2">
          <div className="text-xs text-[color:var(--color-fg-muted)]">
            Per-dimension averages across all your sessions.
          </div>
          <div className="space-y-1.5">
            {Object.entries(data.radar_scores).map(([dim, value]) => (
              <div key={dim} className="flex items-center gap-2 text-sm">
                <div className="w-24 capitalize text-[color:var(--color-fg-muted)]">
                  {dim.replace("_", " ")}
                </div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <div className="w-8 text-right tabular-nums text-xs font-semibold">
                  {value}
                </div>
              </div>
            ))}
          </div>
          {data.badges.length ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {data.badges.slice(0, 6).map((b) => (
                <span
                  key={b.code}
                  className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[11px]"
                  title={b.description ?? ""}
                >
                  <span>{b.emoji}</span>
                  {b.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
