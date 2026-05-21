"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
  sessionsPlayed?: number;
}

export function StreakBadge({ streak, sessionsPlayed }: StreakBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
        <Flame className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          Streak
        </div>
        <div className="text-base font-semibold leading-tight">
          {streak > 0 ? `${streak} in a row` : "Start one"}
        </div>
        {sessionsPlayed != null ? (
          <div className="text-[11px] text-[color:var(--color-fg-subtle)]">
            {sessionsPlayed} session{sessionsPlayed === 1 ? "" : "s"} total
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
