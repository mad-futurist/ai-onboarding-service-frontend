"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ArenaLeaderboardEntry, ID } from "@/types";

interface LeaderboardStripProps {
  entries: ArenaLeaderboardEntry[];
  highlightNewcomerId?: ID | null;
}

export function LeaderboardStrip({ entries, highlightNewcomerId }: LeaderboardStripProps) {
  if (!entries.length) {
    return null;
  }
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        <Trophy className="h-3.5 w-3.5 text-[color:var(--color-warning)]" />
        Leaderboard
      </div>
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {entries.slice(0, 5).map((entry, index) => {
            const isMe = highlightNewcomerId === entry.newcomer_id;
            return (
              <motion.div
                key={entry.newcomer_id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm",
                  isMe
                    ? "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
                    : "hover:bg-[color:var(--color-surface-muted)]",
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[10px] font-semibold tabular-nums">
                  {index + 1}
                </span>
                <span className="flex-1 truncate text-[13px] font-medium">{entry.name}</span>
                {entry.streak > 0 ? (
                  <span className="text-[11px] text-[color:var(--color-warning)]">
                    🔥 {entry.streak}
                  </span>
                ) : null}
                <span className="tabular-nums text-[13px] font-semibold">
                  {Math.round(entry.overall_score)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
