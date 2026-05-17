"use client";

import { AlertTriangle, CalendarDays, CheckCircle2, MessageCircle, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SeverityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { humanizeSignalType } from "@/lib/constants";
import { fmtRelative } from "@/lib/format";
import type { AISignal } from "@/types";

interface SignalRowProps {
  signal: AISignal;
  onResolve?: (s: AISignal) => void;
  onIgnore?: (s: AISignal) => void;
  onSchedule?: (s: AISignal) => void;
  onAdjustPlan?: (s: AISignal) => void;
  onMakeCourse?: (s: AISignal) => void;
  onOpen?: (s: AISignal) => void;
  compact?: boolean;
}

export function SignalRow({
  signal,
  onResolve,
  onIgnore,
  onSchedule,
  onAdjustPlan,
  onMakeCourse,
  onOpen,
  compact,
}: SignalRowProps) {
  const occurrenceCount = signal.occurrence_count ?? 0;

  return (
    <article className="relative overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg ai-gradient-soft border border-[color:var(--color-primary-ring)]">
          <AlertTriangle className="h-4 w-4 text-[color:var(--color-primary-active)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">{signal.title}</h3>
            <span className="rounded-full bg-[color:var(--color-primary-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)] flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI signal
            </span>
            <SeverityBadge severity={signal.severity} size="sm" />
            <StatusBadge status={signal.status} size="sm" />
            <span className="text-xs text-[color:var(--color-fg-subtle)] ml-auto">
              {fmtRelative(signal.created_at)}
            </span>
          </div>
          <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{signal.description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-xs text-[color:var(--color-fg-muted)]">
              {humanizeSignalType(signal.signal_type)}
            </span>
            <span className="rounded-full border border-[color:var(--color-border)] bg-white px-2 py-0.5 text-xs text-[color:var(--color-fg-muted)]">
              confidence {Math.round((signal.confidence ?? signal.score ?? 0) * 100)}%
            </span>
            {occurrenceCount > 1 ? (
              <span className="rounded-full border border-[color:var(--color-border)] bg-white px-2 py-0.5 text-xs text-[color:var(--color-fg-muted)]">
                seen {occurrenceCount}x
              </span>
            ) : null}
          </div>

          {!compact && signal.evidence ? (
            <details className="mt-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/60 p-3 text-xs text-[color:var(--color-fg-muted)]">
              <summary className="cursor-pointer text-[color:var(--color-fg)] text-xs font-medium">Evidence</summary>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
                {signal.evidence}
              </pre>
            </details>
          ) : null}

          {!compact && signal.suggested_action ? (
            <div className="mt-3 rounded-lg border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
                <Sparkles className="h-3 w-3" /> Suggested action
              </div>
              <p className="mt-1 text-sm text-[color:var(--color-fg)]">{signal.suggested_action}</p>
            </div>
          ) : null}

          {onOpen || ((onResolve || onIgnore || onSchedule || onAdjustPlan || onMakeCourse) && signal.status === "open") ? (
            <div className="mt-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/70 p-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                Actions
              </div>
              <div className="flex flex-wrap gap-2">
                {onOpen ? (
                  <Button size="sm" variant="outline" onClick={() => onOpen(signal)}>
                    <MessageCircle className="h-3.5 w-3.5" /> Open chat
                  </Button>
                ) : null}
                {onMakeCourse && signal.status === "open" ? (
                  <Button size="sm" variant="ai" onClick={() => onMakeCourse(signal)}>
                    <Sparkles className="h-3.5 w-3.5" /> Make course
                  </Button>
                ) : null}
                {onAdjustPlan && signal.status === "open" ? (
                  <Button size="sm" variant="ai" onClick={() => onAdjustPlan(signal)}>
                    <Sparkles className="h-3.5 w-3.5" /> Regenerate plan
                  </Button>
                ) : null}
                {onSchedule && signal.status === "open" ? (
                  <Button size="sm" variant="outline" onClick={() => onSchedule(signal)}>
                    <CalendarDays className="h-3.5 w-3.5" />
                    Schedule walkthrough
                  </Button>
                ) : null}
                {onResolve && signal.status === "open" ? (
                  <Button size="sm" variant="ghost" onClick={() => onResolve(signal)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </Button>
                ) : null}
                {onIgnore && signal.status === "open" ? (
                  <Button size="sm" variant="ghost" onClick={() => onIgnore(signal)}>
                    <X className="h-3.5 w-3.5" /> Ignore
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
