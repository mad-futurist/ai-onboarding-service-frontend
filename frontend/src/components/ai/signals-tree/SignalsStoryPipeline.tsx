"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Pause, Sparkles, AlertTriangle, Flame } from "lucide-react";

import { fmtRelative } from "@/lib/format";
import { humanizeSignalType } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { AISignal, SignalAudience } from "@/types";

import {
  TONE_BG_SOFT,
  TONE_BORDER,
  TONE_DOT,
  TONE_GRADIENT,
  TONE_TEXT,
  toneOf,
  type Tone,
} from "./toneClasses";

interface SignalsStoryPipelineProps {
  signals: AISignal[];
  audience: SignalAudience;
  onSelectSignal: (s: AISignal) => void;
}

const TONE_ICON = {
  positive: Sparkles,
  attention: AlertTriangle,
  critical: Flame,
} as const;

type Filter = "all" | Tone;

export function SignalsStoryPipeline({ signals, onSelectSignal }: SignalsStoryPipelineProps) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [playing, setPlaying] = React.useState(false);
  const [playhead, setPlayhead] = React.useState(0); // 0..1
  const rafRef = React.useRef<number | null>(null);
  const playStartRef = React.useRef<number | null>(null);

  const sorted = React.useMemo(() => {
    return [...signals].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [signals]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((s) => toneOf(s) === filter);
  }, [sorted, filter]);

  const first = filtered[0]?.created_at ?? new Date().toISOString();
  const last = filtered[filtered.length - 1]?.created_at ?? first;
  const firstMs = new Date(first).getTime();
  const lastMs = new Date(last).getTime();
  const span = Math.max(1, lastMs - firstMs);

  const positionOf = React.useCallback(
    (s: AISignal) => {
      const t = new Date(s.created_at).getTime();
      return ((t - firstMs) / span) * 100;
    },
    [firstMs, span],
  );

  React.useEffect(() => {
    if (!playing) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      playStartRef.current = null;
      return;
    }
    const duration = 2400;
    const tick = (t: number) => {
      if (playStartRef.current == null) playStartRef.current = t;
      const elapsed = t - playStartRef.current;
      const p = Math.min(1, elapsed / duration);
      setPlayhead(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    setPlayhead(0);
    playStartRef.current = null;
    setPlaying(true);
  };

  const filterChip = (
    key: Filter,
    label: string,
    tone?: Tone,
  ) => (
    <button
      key={key}
      type="button"
      onClick={() => setFilter(key)}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
        filter === key
          ? "border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
          : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)]",
      ].join(" ")}
    >
      {tone ? <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} /> : null}
      {label}
    </button>
  );

  if (!signals.length) {
    return (
      <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white p-8 text-center text-sm text-[color:var(--color-fg-muted)]">
        No signals to replay yet.
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            Story pipeline
          </div>
          <h3 className="text-base font-semibold tracking-tight">
            The signals timeline
          </h3>
          <p className="text-xs text-[color:var(--color-fg-muted)]">
            Replay how the AI built its picture of this journey — earliest signals on the left.
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {filterChip("all", "All")}
          {filterChip("positive", "Positive", "positive")}
          {filterChip("attention", "Attention", "attention")}
          {filterChip("critical", "Critical", "critical")}
          <Button
            size="sm"
            variant={playing ? "outline" : "ai"}
            onClick={togglePlay}
            disabled={reduced || filtered.length < 2}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? "Pause" : "Replay"}
          </Button>
        </div>
      </div>

      <div className="relative mt-6 pb-2">
        <div className="relative h-2 w-full rounded-full bg-[color:var(--color-surface-muted)] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 right-0 opacity-70"
            style={{
              background:
                "linear-gradient(90deg, var(--color-ai-from) 0%, var(--color-ai-via) 50%, var(--color-ai-to) 100%)",
            }}
          />
          {playing || playhead > 0 ? (
            <motion.div
              className="absolute inset-y-0 left-0 bg-white/70 mix-blend-overlay"
              style={{ width: `${(1 - playhead) * 100}%`, left: `${playhead * 100}%` }}
              transition={{ duration: 0 }}
            />
          ) : null}
        </div>

        <div className="relative -mt-4 h-12">
          {filtered.map((s) => {
            const x = positionOf(s);
            const tone = toneOf(s);
            const Icon = TONE_ICON[tone];
            const lit = playhead >= x / 100;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSignal(s)}
                style={{ left: `${x}%` }}
                className={[
                  "group absolute -translate-x-1/2 top-1/2 -mt-3 grid h-6 w-6 place-items-center rounded-full border-2 border-white transition-transform",
                  TONE_GRADIENT[tone],
                  lit
                    ? "scale-110 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.18)]"
                    : "shadow-[0_2px_6px_rgba(15,23,42,0.12)]",
                  "hover:scale-125",
                ].join(" ")}
                title={s.title}
              >
                <Icon className="h-3 w-3 text-white" />
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[color:var(--color-border)] bg-white px-2 py-1 text-[11px] shadow-[var(--shadow-elevated)] group-hover:block">
                  <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
                  {s.title}
                  <span className="ml-1 text-[color:var(--color-fg-faint)]">
                    · {fmtRelative(s.created_at)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-[color:var(--color-fg-faint)]">
          <span>{fmtRelative(first)}</span>
          <span>{fmtRelative(last)}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {filtered.slice(-4).reverse().map((s) => {
          const tone = toneOf(s);
          const Icon = TONE_ICON[tone];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSignal(s)}
              className={`flex items-start gap-2 rounded-lg border p-2 text-left hover:bg-[color:var(--color-surface-muted)] ${TONE_BORDER[tone]} ${TONE_BG_SOFT[tone]}`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${TONE_GRADIENT[tone]}`}
              >
                <Icon className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="min-w-0">
                <div className={`text-xs font-semibold ${TONE_TEXT[tone]}`}>
                  {humanizeSignalType(s.signal_type)}
                </div>
                <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">
                  {s.title}
                </div>
                <div className="text-[11px] text-[color:var(--color-fg-faint)]">
                  {fmtRelative(s.created_at)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
