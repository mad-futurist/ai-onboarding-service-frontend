"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Sparkles, Target, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { KbHelperPanel } from "@/components/arena/KbHelperPanel";
import type {
  ArenaAnalysisFrame,
  ArenaScenario,
  ArenaMessageColor,
  ArenaRadarDimension,
  ID,
} from "@/types";

const DIMENSION_LABEL: Record<ArenaRadarDimension, string> = {
  opening: "Opening",
  discovery: "Discovery",
  objections: "Objections",
  closing: "Closing",
  product_knowledge: "Product",
};

const COLOR_DOT: Record<ArenaMessageColor, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-rose-500",
  neutral: "bg-stone-400",
};

interface LiveAnalysisPanelProps {
  scenario?: ArenaScenario | null;
  sessionId: ID;
  liveScore: number;
  scoreLog: ArenaAnalysisFrame[];
  isStreaming: boolean;
}

export function LiveAnalysisPanel({
  scenario,
  sessionId,
  liveScore,
  scoreLog,
  isStreaming,
}: LiveAnalysisPanelProps) {
  const lastFrame = scoreLog[scoreLog.length - 1];
  const [goalOpen, setGoalOpen] = React.useState(true);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-4">
      {/* Live score meter */}
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Live score
          </span>
          {isStreaming ? (
            <span className="text-[10px] text-[color:var(--color-primary)]">listening…</span>
          ) : null}
        </div>
        <div className="mt-2 text-3xl font-semibold tabular-nums leading-none">
          {Math.round(liveScore)}
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
            style={{ width: `${Math.max(0, Math.min(100, liveScore))}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        {lastFrame ? (
          <motion.div
            key={`${lastFrame.messageId}-${lastFrame.label}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-xs text-[color:var(--color-fg-muted)]"
          >
            Last delta:{" "}
            <span
              className={cn(
                "font-semibold",
                lastFrame.delta > 0
                  ? "text-emerald-600"
                  : lastFrame.delta < 0
                    ? "text-rose-600"
                    : "text-[color:var(--color-fg-muted)]",
              )}
            >
              {lastFrame.delta > 0 ? "+" : ""}
              {lastFrame.delta}
            </span>{" "}
            on {DIMENSION_LABEL[lastFrame.dimension]}
          </motion.div>
        ) : null}
      </div>

      {/* Goal */}
      {scenario?.goal_text ? (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
          <button
            type="button"
            onClick={() => setGoalOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-ring)]"
            aria-expanded={goalOpen}
          >
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" /> Session goal
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform",
                !goalOpen && "-rotate-90",
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {goalOpen ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <p className="text-sm leading-snug">{scenario.goal_text}</p>
                  {scenario.success_criteria && Array.isArray(scenario.success_criteria) ? (
                    <ul className="mt-2 space-y-1 text-xs text-[color:var(--color-fg-muted)]">
                      {scenario.success_criteria.map((criterion, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      {/* KB helper */}
      {Number.isFinite(sessionId) ? <KbHelperPanel sessionId={sessionId} /> : null}

      {/* Per-message analysis log */}
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          <Trophy className="h-3 w-3" /> Message-by-message
        </div>
        <div className="-mr-2 mt-2 flex-1 space-y-1.5 overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {scoreLog.length === 0 ? (
              <div className="py-6 text-center text-xs text-[color:var(--color-fg-subtle)]">
                Send a message — analysis appears here.
              </div>
            ) : null}
            {[...scoreLog].reverse().map((frame, idx) => (
              <motion.div
                key={`${frame.messageId}-${idx}`}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 rounded-md bg-[color:var(--color-surface-muted)]/40 px-2 py-1.5 text-xs"
              >
                <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", COLOR_DOT[frame.color])} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{frame.label}</span>
                    <span
                      className={cn(
                        "tabular-nums font-semibold",
                        frame.delta > 0
                          ? "text-emerald-600"
                          : frame.delta < 0
                            ? "text-rose-600"
                            : "text-[color:var(--color-fg-muted)]",
                      )}
                    >
                      {frame.delta > 0 ? "+" : ""}
                      {frame.delta}
                    </span>
                  </div>
                  <div className="text-[11px] text-[color:var(--color-fg-muted)]">
                    {DIMENSION_LABEL[frame.dimension]}
                    {frame.why ? ` — ${frame.why}` : ""}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
