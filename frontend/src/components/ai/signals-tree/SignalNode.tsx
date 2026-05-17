"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Sparkles, Flame, CheckCircle2, MessageSquare } from "lucide-react";

import { fmtRelative } from "@/lib/format";
import type { AISignal } from "@/types";
import { humanizeSignalType } from "@/lib/constants";
import {
  TONE_BG_SOFT,
  TONE_BORDER,
  TONE_DOT,
  TONE_GLOW,
  TONE_TEXT,
  isFresh,
  toneOf,
} from "./toneClasses";

interface SignalNodeProps {
  signal: AISignal;
  onClick?: () => void;
}

const TONE_ICON = {
  positive: Sparkles,
  attention: AlertTriangle,
  critical: Flame,
} as const;

export function SignalNode({ signal, onClick }: SignalNodeProps) {
  const tone = toneOf(signal);
  const Icon = TONE_ICON[tone];
  const fresh = isFresh(signal);
  const acked = !!signal.acknowledged_at;
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, scale: 0.94, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={reduced ? undefined : { y: -1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={[
        "group relative w-full text-left rounded-xl border bg-white p-3 transition-colors",
        TONE_BORDER[tone],
        "hover:border-[color:var(--color-primary-ring)]",
        fresh && !reduced ? TONE_GLOW[tone] : "shadow-[var(--shadow-card)]",
      ].join(" ")}
      data-demo-id={tone === "attention" ? "signals-attention-signal" : undefined}
    >
      {fresh && !reduced ? (
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute -inset-px rounded-xl opacity-60",
            "animate-[signal-pulse_2.4s_ease-in-out_infinite]",
          ].join(" ")}
        />
      ) : null}

      <div className="flex items-start gap-2.5">
        <span
          className={[
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
            TONE_BORDER[tone],
            TONE_BG_SOFT[tone],
          ].join(" ")}
        >
          <Icon className={`h-4 w-4 ${TONE_TEXT[tone]}`} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TONE_BG_SOFT[tone]} ${TONE_TEXT[tone]}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
              {tone === "positive" ? "good signal" : tone}
            </span>
            <span className="text-[11px] text-[color:var(--color-fg-subtle)]">
              {humanizeSignalType(signal.signal_type)}
            </span>
            <span className="ml-auto text-[11px] text-[color:var(--color-fg-faint)]">
              {fmtRelative(signal.created_at)}
            </span>
          </div>

          <h4 className="mt-0.5 text-sm font-semibold tracking-tight text-[color:var(--color-fg)] line-clamp-2">
            {signal.title}
          </h4>

          {signal.description ? (
            <p className="mt-0.5 text-xs text-[color:var(--color-fg-muted)] line-clamp-2">
              {signal.description}
            </p>
          ) : null}

          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[color:var(--color-fg-subtle)]">
            <span>conf {Math.round((signal.confidence ?? signal.score ?? 0) * 100)}%</span>
            {(signal.occurrence_count ?? 0) > 1 ? (
              <span>· seen {signal.occurrence_count}x</span>
            ) : null}
            <span className="ml-auto inline-flex items-center gap-1 text-[color:var(--color-fg-muted)] opacity-0 transition-opacity group-hover:opacity-100">
              <MessageSquare className="h-3 w-3" /> open
            </span>
            {acked ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> acknowledged
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
