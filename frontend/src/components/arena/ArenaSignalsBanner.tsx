"use client";

import { useQuery } from "@tanstack/react-query";
import { Swords, AlertCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listSignalsForMe } from "@/services/signals";
import type { ID } from "@/types";

interface ArenaSignalsBannerProps {
  newcomerId: ID | null;
}

export function ArenaSignalsBanner({ newcomerId }: ArenaSignalsBannerProps) {
  const { data } = useQuery({
    queryKey: ["signals-me", newcomerId],
    queryFn: () => listSignalsForMe(newcomerId!),
    enabled: !!newcomerId,
  });

  const arenaSignals = (data ?? []).filter(
    (s) => s.signal_type.startsWith("arena_low_") && s.status === "open",
  );

  return (
    <div className="rounded-2xl border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <Swords className="h-4 w-4 text-[color:var(--color-primary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            From the Customer Training Arena
            {arenaSignals.length ? (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                {arenaSignals.length} open
              </span>
            ) : null}
          </div>
          {arenaSignals.length ? (
            <>
              <p className="mt-1 text-sm text-[color:var(--color-primary-active)]">
                Your mentor is seeing these. They&rsquo;re triggered when the same dimension
                stays weak across multiple Arena sessions.
              </p>
              <ul className="mt-2 space-y-1">
                {arenaSignals.slice(0, 3).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start gap-2 text-[12.5px] text-[color:var(--color-fg)]"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                    <span className="font-medium">{s.title}</span>
                    <span className="text-[11px] text-[color:var(--color-fg-muted)]">
                      · seen {s.occurrence_count ?? 1}×
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1 text-sm text-[color:var(--color-primary-active)]">
              Arena results feed your signals automatically. Three weak sessions on the same
              dimension and your mentor is pinged — no manual reporting needed.
            </p>
          )}
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/newcomer/arena">
            <Swords className="h-3.5 w-3.5" /> Open Arena
          </Link>
        </Button>
      </div>
    </div>
  );
}
