"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ChevronDown, Network, Sparkles } from "lucide-react";

import type { AISignal, SignalAudience } from "@/types";

import { SignalNode } from "./SignalNode";
import { CountUp } from "./CountUp";
import {
  TONE_BG_SOFT,
  TONE_BORDER,
  TONE_DOT,
  TONE_GRADIENT,
  TONE_TEXT,
  toneOf,
  worstTone,
  type Tone,
} from "./toneClasses";

interface SignalsArborescenceProps {
  signals: AISignal[];
  audience: SignalAudience;
  onSelectSignal: (s: AISignal) => void;
  planTitle?: string;
}

interface Bucket {
  key: string;
  label: string;
  signals: AISignal[];
  children?: Bucket[];
}

function groupSignals(signals: AISignal[]): {
  planLevel: AISignal[];
  weekBuckets: Bucket[];
  unscoped: AISignal[];
} {
  const planLevel: AISignal[] = [];
  const byWeek: Record<string, AISignal[]> = {};
  const byWeekTask: Record<string, Record<string, AISignal[]>> = {};
  const unscoped: AISignal[] = [];

  for (const s of signals) {
    const scope = s.target_scope;
    if (scope === "plan") {
      planLevel.push(s);
    } else if (scope === "task" && s.target_task_id != null) {
      const wk = s.target_week_id != null ? String(s.target_week_id) : "unassigned";
      byWeekTask[wk] ??= {};
      const tk = String(s.target_task_id);
      byWeekTask[wk][tk] ??= [];
      byWeekTask[wk][tk].push(s);
    } else if (scope === "week" && s.target_week_id != null) {
      const wk = String(s.target_week_id);
      byWeek[wk] ??= [];
      byWeek[wk].push(s);
    } else {
      unscoped.push(s);
    }
  }

  const allWeekKeys = new Set<string>([
    ...Object.keys(byWeek),
    ...Object.keys(byWeekTask),
  ]);

  const weekBuckets: Bucket[] = Array.from(allWeekKeys)
    .sort((a, b) => {
      if (a === "unassigned") return 1;
      if (b === "unassigned") return -1;
      return Number(a) - Number(b);
    })
    .map((wk) => {
      const weekSignals = byWeek[wk] ?? [];
      const taskMap = byWeekTask[wk] ?? {};
      const children: Bucket[] = Object.entries(taskMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([taskId, sigs]) => ({
          key: `task-${taskId}`,
          label: sigs[0]?.title ?? `Task #${taskId}`,
          signals: sigs,
        }));
      return {
        key: `week-${wk}`,
        label: wk === "unassigned" ? "Tasks (no week)" : `Week #${wk}`,
        signals: weekSignals,
        children,
      };
    });

  return { planLevel, weekBuckets, unscoped };
}

export function SignalsArborescence({
  signals,
  audience,
  onSelectSignal,
  planTitle,
}: SignalsArborescenceProps) {
  const reduced = useReducedMotion();
  const { planLevel, weekBuckets, unscoped } = React.useMemo(
    () => groupSignals(signals),
    [signals],
  );
  const totalTone: Tone = worstTone(signals) ?? "positive";
  const total = signals.length;
  const positiveCount = signals.filter((s) => toneOf(s) === "positive").length;

  if (!signals.length) {
    return (
      <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white p-8 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full ai-gradient-soft">
          <Sparkles className="h-5 w-5 text-[color:var(--color-primary-active)]" />
        </div>
        <p className="mt-3 text-sm font-medium">
          {audience === "newcomer" ? "AI is still learning your rhythm" : "Tree is empty"}
        </p>
        <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
          New signals will appear here as they are detected.
        </p>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  };

  const branchVariants: Variants = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 22 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative rounded-[14px] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]"
    >
      <motion.div variants={branchVariants} className="flex items-start gap-3">
        <div
          className={[
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white",
            TONE_GRADIENT[totalTone],
            !reduced ? "shadow-[0_8px_30px_-6px_rgba(249,115,22,0.45)]" : "",
          ].join(" ")}
        >
          <Network className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            Plan signals tree
          </div>
          <h3 className="text-base font-semibold tracking-tight text-[color:var(--color-fg)]">
            {planTitle ?? "Onboarding plan"}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-fg-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[totalTone]}`} />
              <CountUp to={total} className="font-semibold text-[color:var(--color-fg)]" /> signals
            </span>
            {positiveCount > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT.positive}`} />
                <CountUp to={positiveCount} className="font-semibold text-emerald-700" /> positive
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT.attention}`} />
              {weekBuckets.length} week branches
            </span>
          </div>
        </div>
      </motion.div>

      {planLevel.length ? (
        <motion.div variants={branchVariants} className="mt-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            Plan-level
          </div>
          <div className="ml-1 grid gap-2 sm:grid-cols-2">
            {planLevel.map((s) => (
              <SignalNode key={s.id} signal={s} onClick={() => onSelectSignal(s)} />
            ))}
          </div>
        </motion.div>
      ) : null}

      <div className="mt-5 space-y-3">
        {weekBuckets.map((bucket) => (
          <WeekBranch
            key={bucket.key}
            bucket={bucket}
            onSelectSignal={onSelectSignal}
            variants={branchVariants}
          />
        ))}
      </div>

      {unscoped.length ? (
        <motion.div variants={branchVariants} className="mt-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            Other
          </div>
          <div className="ml-1 grid gap-2 sm:grid-cols-2">
            {unscoped.map((s) => (
              <SignalNode key={s.id} signal={s} onClick={() => onSelectSignal(s)} />
            ))}
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

interface WeekBranchProps {
  bucket: Bucket;
  onSelectSignal: (s: AISignal) => void;
  variants: Variants;
}

function WeekBranch({ bucket, onSelectSignal, variants }: WeekBranchProps) {
  const [open, setOpen] = React.useState(true);
  const allWeekSignals = React.useMemo(() => {
    const collected: AISignal[] = [...bucket.signals];
    for (const ch of bucket.children ?? []) collected.push(...ch.signals);
    return collected;
  }, [bucket]);

  const tone = worstTone(allWeekSignals) ?? "attention";
  const positives = allWeekSignals.filter((s) => toneOf(s) === "positive").length;

  return (
    <motion.div variants={variants}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
          TONE_BORDER[tone],
          TONE_BG_SOFT[tone],
          TONE_TEXT[tone],
          "hover:brightness-105",
        ].join(" ")}
      >
        <span className={`h-2 w-2 rounded-full ${TONE_DOT[tone]}`} />
        <span>{bucket.label}</span>
        <span className="ml-1 rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] font-medium text-[color:var(--color-fg-muted)]">
          {allWeekSignals.length} signal{allWeekSignals.length > 1 ? "s" : ""}
          {positives ? ` · ${positives} positive` : ""}
        </span>
        <ChevronDown
          className={`ml-auto h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="relative ml-3 mt-2 border-l border-dashed border-[color:var(--color-border)] pl-4">
              {bucket.signals.length ? (
                <div className="mb-2 grid gap-2 sm:grid-cols-2">
                  {bucket.signals.map((s) => (
                    <SignalNode key={s.id} signal={s} onClick={() => onSelectSignal(s)} />
                  ))}
                </div>
              ) : null}

              {bucket.children?.map((child) => (
                <div key={child.key} className="mb-3">
                  <div className="mb-1.5 ml-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    Task · {child.signals.length} signal{child.signals.length > 1 ? "s" : ""}
                  </div>
                  <div className="ml-1 grid gap-2 sm:grid-cols-2">
                    {child.signals.map((s) => (
                      <SignalNode key={s.id} signal={s} onClick={() => onSelectSignal(s)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
