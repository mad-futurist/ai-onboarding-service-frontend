"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  FileText,
  Mic,
  Sparkles,
  Target,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SourcesPicker } from "@/components/mentor/plan-generator/SourcesPicker";
import { fmtDate } from "@/lib/format";
import type { ID, JourneyPeriod, Newcomer, NewcomerJourney } from "@/types";

export type PeriodFlowMode = "fast" | "live";

export interface PeriodFlowSubmit {
  label: string;
  start: string;
  end: string;
  goal: string;
  mode: PeriodFlowMode;
  sources: Set<ID>;
  notes: string;
}

interface PeriodFlowSheetProps {
  open: boolean;
  onClose: () => void;
  newcomer?: Newcomer;
  journey?: NewcomerJourney;
  initialNotes?: string;
  initialSources: Set<ID>;
  onSubmit: (input: PeriodFlowSubmit) => void;
}

type Step = "period" | "mode" | "review";

const PRESETS = [
  { label: "First 30 days", offset: 0, length: 30 },
  { label: "Days 31–60", offset: 30, length: 30 },
  { label: "Days 61–90", offset: 60, length: 30 },
  { label: "Days 91–120", offset: 90, length: 30 },
];

const DAY_MS = 86_400_000;

export function PeriodFlowSheet({
  open,
  onClose,
  newcomer,
  journey,
  initialNotes = "",
  initialSources,
  onSubmit,
}: PeriodFlowSheetProps) {
  const reduce = useReducedMotion();
  const [step, setStep] = React.useState<Step>("period");
  const [label, setLabel] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [notes, setNotes] = React.useState(initialNotes);
  const [mode, setMode] = React.useState<PeriodFlowMode>("fast");
  const [sources, setSources] = React.useState<Set<ID>>(initialSources);

  // Seed defaults when the sheet opens.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setStep("period");
      setNotes(initialNotes);
      setSources(new Set(initialSources));

      const nextOffset = inferNextOffset(journey);
      const preset = PRESETS.find((p) => p.offset === nextOffset) ?? PRESETS[0];
      const startAnchor = newcomer?.start_date ?? new Date().toISOString().slice(0, 10);
      setLabel(preset.label);
      setStart(addDays(startAnchor, preset.offset));
      setEnd(addDays(startAnchor, preset.offset + preset.length - 1));
      setGoal(newcomer?.main_goal ?? "");
      setMode("fast");
    });
    return () => {
      cancelled = true;
    };
  }, [open, journey, newcomer, initialNotes, initialSources]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const startAnchor = newcomer?.start_date ?? new Date().toISOString().slice(0, 10);
    setLabel(preset.label);
    setStart(addDays(startAnchor, preset.offset));
    setEnd(addDays(startAnchor, preset.offset + preset.length - 1));
  };

  const canNext =
    step === "period"
      ? Boolean(label.trim() && start && end)
      : step === "mode"
        ? true
        : true;

  const goNext = () => {
    if (step === "period") setStep("mode");
    else if (step === "mode") setStep("review");
  };

  const goBack = () => {
    if (step === "mode") setStep("period");
    else if (step === "review") setStep("mode");
  };

  const handleSubmit = () => {
    onSubmit({ label, start, end, goal, mode, sources, notes });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Animated overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/45 backdrop-blur-[3px]"
      />

      {/* Sheet */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-0 top-6 mx-auto flex max-w-5xl flex-col overflow-hidden rounded-t-[24px] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-elevated)] sm:inset-y-6 sm:rounded-[24px]"
        data-demo-id="period-flow-sheet"
      >
        {/* Header */}
        <header className="relative border-b border-[color:var(--color-border)] bg-gradient-to-b from-white to-[color:var(--color-bg)] px-6 py-4">
          <div className="absolute inset-x-0 top-0 h-[2px] ai-gradient" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg ai-gradient text-white shadow-[var(--shadow-ai)]">
                <Wand2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
                  New period
                </div>
                <h2 className="text-base font-semibold tracking-tight text-[color:var(--color-fg)]">
                  Generate the next chapter for{" "}
                  <span className="ai-gradient-text">
                    {newcomer?.full_name ?? "your newcomer"}
                  </span>
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-[color:var(--color-fg-muted)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Stepper */}
          <StepRail current={step} />
        </header>

        {/* Body */}
        <div className="relative flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {step === "period" ? (
              <motion.div
                key="period"
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                transition={{ duration: 0.24 }}
              >
                <PeriodStep
                  newcomer={newcomer}
                  journey={journey}
                  label={label}
                  start={start}
                  end={end}
                  goal={goal}
                  sources={sources}
                  notes={notes}
                  onLabelChange={setLabel}
                  onStartChange={setStart}
                  onEndChange={setEnd}
                  onGoalChange={setGoal}
                  onNotesChange={setNotes}
                  onSourcesChange={setSources}
                  onApplyPreset={applyPreset}
                />
              </motion.div>
            ) : null}

            {step === "mode" ? (
              <motion.div
                key="mode"
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                transition={{ duration: 0.24 }}
              >
                <ModeStep mode={mode} onChange={setMode} />
              </motion.div>
            ) : null}

            {step === "review" ? (
              <motion.div
                key="review"
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                transition={{ duration: 0.24 }}
              >
                <ReviewStep
                  label={label}
                  start={start}
                  end={end}
                  goal={goal}
                  mode={mode}
                  notes={notes}
                  sourcesCount={sources.size}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="border-t border-[color:var(--color-border)] bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[color:var(--color-fg-muted)]">
              {step === "period" && "Step 1 of 3 · Define what this period covers"}
              {step === "mode" && "Step 2 of 3 · Choose how the AI works with you"}
              {step === "review" && "Step 3 of 3 · One last check before generation"}
            </div>
            <div className="flex items-center gap-2">
              {step === "period" ? (
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              ) : (
                <Button variant="ghost" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {step !== "review" ? (
                <Button
                  variant="ai"
                  onClick={goNext}
                  disabled={!canNext}
                  data-demo-id="period-flow-next"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ai"
                  onClick={handleSubmit}
                  className="shadow-[var(--shadow-ai)]"
                  data-demo-id="period-flow-generate"
                >
                  <Sparkles className="h-4 w-4" />
                  {mode === "live" ? "Open live mode" : "Generate draft"}
                </Button>
              )}
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

/* ---------- step rail ---------- */

function StepRail({ current }: { current: Step }) {
  const order: Step[] = ["period", "mode", "review"];
  const idx = order.indexOf(current);
  const labels: Record<Step, string> = {
    period: "Period",
    mode: "Mode",
    review: "Review",
  };
  return (
    <ol className="mt-4 flex items-center gap-2">
      {order.map((s, i) => {
        const isCurrent = s === current;
        const isDone = i < idx;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold transition",
                isDone
                  ? "bg-[color:var(--color-success)] text-white"
                  : isCurrent
                    ? "ai-gradient text-white shadow-[var(--shadow-ai)]"
                    : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
              )}
            >
              {isDone ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wider",
                isCurrent
                  ? "text-[color:var(--color-fg)]"
                  : "text-[color:var(--color-fg-subtle)]",
              )}
            >
              {labels[s]}
            </span>
            {i < order.length - 1 ? (
              <div className="ml-1 mr-1 h-px flex-1 bg-[color:var(--color-border)]" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- step: PERIOD ---------- */

function PeriodStep({
  newcomer,
  journey,
  label,
  start,
  end,
  goal,
  sources,
  notes,
  onLabelChange,
  onStartChange,
  onEndChange,
  onGoalChange,
  onNotesChange,
  onSourcesChange,
  onApplyPreset,
}: {
  newcomer?: Newcomer;
  journey?: NewcomerJourney;
  label: string;
  start: string;
  end: string;
  goal: string;
  sources: Set<ID>;
  notes: string;
  onLabelChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onGoalChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSourcesChange: React.Dispatch<React.SetStateAction<Set<ID>>>;
  onApplyPreset: (preset: (typeof PRESETS)[number]) => void;
}) {
  const startDay = computeDayFromStart(newcomer, start);
  const endDay = computeDayFromStart(newcomer, end);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]" data-demo-id="period-flow-period">
      <div className="space-y-6">
        {/* Mini-timeline showing where this new period lands */}
        <MiniTimeline journey={journey} startDay={startDay} endDay={endDay} />

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider">Quick presets</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active = p.label === label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onApplyPreset(p)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "ai-gradient-soft border-[color:var(--color-primary-ring)] text-[color:var(--color-primary-active)]"
                      : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-primary-ring)] hover:text-[color:var(--color-fg)]",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Label, dates, goal */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label" full>
            <Input
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              data-demo-id="period-flow-label"
            />
          </Field>
          <Field label="Start date">
            <Input
              type="date"
              value={start}
              onChange={(e) => onStartChange(e.target.value)}
              data-demo-id="period-flow-start"
            />
          </Field>
          <Field label="End date">
            <Input
              type="date"
              value={end}
              onChange={(e) => onEndChange(e.target.value)}
              data-demo-id="period-flow-end"
            />
          </Field>
          <Field label="Goal for this period" full>
            <Textarea
              rows={3}
              value={goal}
              placeholder="e.g. Own a small feature end-to-end with minimal mentor help."
              onChange={(e) => onGoalChange(e.target.value)}
              data-demo-id="period-flow-goal"
            />
          </Field>
          <Field label="Mentor notes (intent for the AI)" full>
            <Textarea
              rows={3}
              value={notes}
              placeholder="Strong on APIs, weak on infra. Lighter week 1, intros booked."
              onChange={(e) => onNotesChange(e.target.value)}
              data-demo-id="period-flow-notes"
            />
          </Field>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            <FileText className="h-3 w-3" /> Sources for this period
          </div>
          <p className="mt-1 text-[11px] text-[color:var(--color-fg-muted)]">
            The AI will ground itself only on what&apos;s ticked here.
          </p>
          <div className="mt-3">
            <SourcesPicker
              selected={sources}
              onToggle={(id) =>
                onSourcesChange((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
              onSelectAll={(ids) => onSourcesChange(new Set(ids))}
              maxHeight="max-h-[260px]"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2")}>
      <Label className="text-[11px] uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

function MiniTimeline({
  journey,
  startDay,
  endDay,
}: {
  journey?: NewcomerJourney;
  startDay: number | null;
  endDay: number | null;
}) {
  const horizon = Math.max(journey?.horizon_days ?? 120, (endDay ?? 0) + 15);
  const pct = (d: number) => (Math.max(0, Math.min(horizon, d)) / horizon) * 100;
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          Position in the journey
        </div>
        {startDay != null && endDay != null ? (
          <Badge tone="ai" size="sm">
            D{startDay} → D{endDay}
          </Badge>
        ) : null}
      </div>
      <div className="relative mt-4 h-2 rounded-full bg-[color:var(--color-surface-muted)]">
        {journey?.periods.map((p) => (
          <div
            key={p.id}
            className={cn(
              "absolute top-0 h-2 rounded-full opacity-60",
              p.status === "approved" ? "bg-[color:var(--color-success)]" : "ai-gradient",
            )}
            style={{
              left: `${pct(p.start_day)}%`,
              width: `${Math.max(2, pct(p.end_day) - pct(p.start_day))}%`,
            }}
          />
        ))}
        {startDay != null && endDay != null ? (
          <motion.div
            layout
            className="absolute top-0 h-2 rounded-full ring-2 ring-[color:var(--color-primary)]"
            style={{
              left: `${pct(startDay)}%`,
              width: `${Math.max(2, pct(endDay) - pct(startDay))}%`,
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.85), rgba(236,72,153,0.85) 55%, rgba(139,92,246,0.85))",
            }}
          />
        ) : null}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[color:var(--color-fg-subtle)]">
        <span>D0</span>
        <span>D{Math.round(horizon / 2)}</span>
        <span>D{horizon}</span>
      </div>
    </div>
  );
}

/* ---------- step: MODE ---------- */

function ModeStep({
  mode,
  onChange,
}: {
  mode: PeriodFlowMode;
  onChange: (m: PeriodFlowMode) => void;
}) {
  return (
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
      <ModeCard
        active={mode === "fast"}
        onClick={() => onChange("fast")}
        icon={<Zap className="h-5 w-5" />}
        title="Fast draft"
        subtitle="Generate in ~10s, you review"
        bullets={["AI runs end-to-end without questions", "Best for routine periods", "You can regenerate anytime"]}
        dataDemoId="period-flow-fast-mode"
      />
      <ModeCard
        active={mode === "live"}
        onClick={() => onChange("live")}
        accent
        icon={<Mic className="h-5 w-5" />}
        title="Live collaboration"
        subtitle="Watch the AI reason and steer it"
        bullets={[
          "Token-by-token streaming",
          "AI asks you 2–4 questions when uncertain",
          "Add comments any time during generation",
        ]}
        dataDemoId="period-flow-live-mode"
      />
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
  bullets,
  accent,
  dataDemoId,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
  accent?: boolean;
  dataDemoId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-demo-id={dataDemoId}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all",
        active
          ? accent
            ? "ai-gradient-soft border-[color:var(--color-primary-ring)] ring-2 ring-[color:var(--color-primary-ring)] shadow-[var(--shadow-ai)]"
            : "border-[color:var(--color-success)] ring-2 ring-[color:var(--color-success)]/40 shadow-[0_8px_28px_-12px_rgb(16_185_129_/_0.45)] bg-[color:var(--color-success-soft)]"
          : "border-[color:var(--color-border)] bg-white hover:-translate-y-0.5 hover:border-[color:var(--color-primary-ring)] hover:shadow-[var(--shadow-card)]",
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 place-items-center rounded-xl",
          accent
            ? "ai-gradient text-white shadow-[var(--shadow-ai)]"
            : "bg-[color:var(--color-success)] text-white",
        )}
      >
        {icon}
      </div>
      <div className="mt-3 text-base font-semibold text-[color:var(--color-fg)]">{title}</div>
      <div className="text-xs text-[color:var(--color-fg-muted)]">{subtitle}</div>
      <ul className="mt-3 space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-[color:var(--color-fg)]">
            <ChevronRight className="mt-0.5 h-3 w-3 text-[color:var(--color-primary)]" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {active ? (
        <motion.span
          layoutId="mode-card-active"
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-primary-active)] ring-1 ring-[color:var(--color-primary-ring)]"
        >
          <Check className="h-3 w-3" /> Selected
        </motion.span>
      ) : null}
    </button>
  );
}

/* ---------- step: REVIEW ---------- */

function ReviewStep({
  label,
  start,
  end,
  goal,
  mode,
  notes,
  sourcesCount,
}: {
  label: string;
  start: string;
  end: string;
  goal: string;
  mode: PeriodFlowMode;
  notes: string;
  sourcesCount: number;
}) {
  const rows = [
    { icon: <Target className="h-4 w-4" />, label: "Period", value: label || "—" },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Window",
      value:
        start && end ? `${fmtDate(start)} → ${fmtDate(end)}` : "Dates not set",
    },
    { icon: <FileText className="h-4 w-4" />, label: "Sources", value: `${sourcesCount} document${sourcesCount === 1 ? "" : "s"}` },
    {
      icon: mode === "live" ? <Mic className="h-4 w-4" /> : <Zap className="h-4 w-4" />,
      label: "Mode",
      value: mode === "live" ? "Live collaboration" : "Fast draft",
    },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-4" data-demo-id="period-flow-review">
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
              Ready to generate
            </div>
            <h3 className="mt-0.5 text-base font-semibold text-[color:var(--color-fg)]">
              Review the brief before launching
            </h3>
          </div>
          <Badge tone="ai" size="lg">
            <Sparkles className="h-3 w-3" /> AI ready
          </Badge>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg ai-gradient-soft text-[color:var(--color-primary-active)]">
                {row.icon}
              </span>
              <div className="min-w-0">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  {row.label}
                </dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-[color:var(--color-fg)]">
                  {row.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        {goal ? (
          <div className="mt-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              Goal
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-fg)]">{goal}</p>
          </div>
        ) : null}

        {notes ? (
          <div className="mt-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              Mentor intent
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-fg)] whitespace-pre-wrap">
              {notes}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function inferNextOffset(journey?: NewcomerJourney): number {
  if (!journey || journey.periods.length === 0) return 0;
  const lastEnd = journey.periods.reduce(
    (acc, p) => Math.max(acc, p.end_day),
    0,
  );
  // Round to nearest 30 boundary above lastEnd.
  return Math.ceil(lastEnd / 30) * 30;
}

function addDays(dateLike: string, days: number): string {
  const d = new Date(`${dateLike.slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function computeDayFromStart(newcomer: Newcomer | undefined, day: string): number | null {
  if (!newcomer?.start_date || !day) return null;
  const start = parseISO(newcomer.start_date);
  const value = parseISO(day);
  return Math.max(0, Math.round((value.getTime() - start.getTime()) / DAY_MS));
}

// Suppress unused-but-used JourneyPeriod import for tree-shaking
export type { JourneyPeriod };
