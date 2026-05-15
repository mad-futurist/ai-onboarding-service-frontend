"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  GraduationCap,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SeverityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { fmtRelative } from "@/lib/format";
import { humanizeSignalType } from "@/lib/constants";

import { acknowledgeSignal, requestPlanAdjustment } from "@/services/signals";
import { toApiError } from "@/lib/api";

import type { AISignal, ID, SignalAudience } from "@/types";

import { SignalNotes } from "./SignalNotes";
import { TONE_BG_SOFT, TONE_GRADIENT, toneOf } from "./toneClasses";

interface SignalDetailDrawerProps {
  signal: AISignal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audience: SignalAudience;
  userId?: ID | null;
  mentorName?: string;
  newcomerName?: string;
  onResolve?: (s: AISignal) => void;
  onIgnore?: (s: AISignal) => void;
  onSchedule?: (s: AISignal) => void;
  onAdjustPlan?: (s: AISignal) => void;
  onMakeCourse?: (s: AISignal) => void;
}

const TONE_ICON = {
  positive: Sparkles,
  attention: AlertTriangle,
  critical: Flame,
} as const;

export function SignalDetailDrawer({
  signal,
  open,
  onOpenChange,
  audience,
  userId,
  mentorName,
  newcomerName,
  onResolve,
  onIgnore,
  onSchedule,
  onAdjustPlan,
  onMakeCourse,
}: SignalDetailDrawerProps) {
  const qc = useQueryClient();

  const ackMut = useMutation({
    mutationFn: (id: ID) => acknowledgeSignal(id),
    onSuccess: () => {
      toast.success("Signal acknowledged");
      qc.invalidateQueries({ queryKey: ["signals"] });
      qc.invalidateQueries({ queryKey: ["signals-me"] });
    },
    onError: (e) => toast.error("Failed", { description: toApiError(e).message }),
  });

  const adjustMut = useMutation({
    mutationFn: (id: ID) =>
      requestPlanAdjustment(id, "Newcomer requests a plan adjustment from this signal.", userId ?? null),
    onSuccess: (_data, id) => {
      toast.success("Mentor notified");
      qc.invalidateQueries({ queryKey: ["signal-comments", id] });
    },
    onError: (e) => toast.error("Failed", { description: toApiError(e).message }),
  });

  if (!signal) return null;
  const tone = toneOf(signal);
  const Icon = TONE_ICON[tone];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto p-0">
        {/* Gradient header strip */}
        <div className={`relative ${TONE_GRADIENT[tone]} p-5 text-white`}>
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
                {tone === "positive" ? "Good signal" : tone === "critical" ? "Critical signal" : "Signal"}
                <span className="opacity-75"> · {humanizeSignalType(signal.signal_type)}</span>
              </div>
              <SheetTitle className="mt-0.5 text-white">{signal.title}</SheetTitle>
              <SheetDescription className="sr-only">
                Signal detail with evidence, suggested action, and comment thread.
              </SheetDescription>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                  conf {Math.round((signal.confidence ?? signal.score ?? 0) * 100)}%
                </span>
                {(signal.occurrence_count ?? 0) > 1 ? (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                    seen {signal.occurrence_count}x
                  </span>
                ) : null}
                <span className="text-[11px] opacity-90">· {fmtRelative(signal.created_at)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md bg-white/10 hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <SeverityBadge severity={signal.severity} size="sm" />
            <StatusBadge status={signal.status} size="sm" />
            {signal.acknowledged_at ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> acknowledged
              </span>
            ) : null}
          </div>

          {signal.description ? (
            <p className="text-sm text-[color:var(--color-fg-muted)]">{signal.description}</p>
          ) : null}

          {signal.evidence ? (
            <details className={`rounded-lg border ${TONE_BG_SOFT[tone]} p-3 text-xs`}>
              <summary className="cursor-pointer text-xs font-semibold text-[color:var(--color-fg)]">
                Evidence
              </summary>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
                {signal.evidence}
              </pre>
            </details>
          ) : null}

          {signal.suggested_action ? (
            <div className="rounded-lg border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
                <Sparkles className="h-3 w-3" /> Suggested action
              </div>
              <p className="mt-1 text-sm text-[color:var(--color-fg)]">{signal.suggested_action}</p>
            </div>
          ) : null}

          {/* Audience-specific actions */}
          <div className="flex flex-wrap gap-2">
            {audience === "mentor" ? (
              <>
                {onMakeCourse ? (
                  <Button size="sm" variant="ai" onClick={() => onMakeCourse(signal)}>
                    <GraduationCap className="h-3.5 w-3.5" /> Make course
                  </Button>
                ) : null}
                {onAdjustPlan ? (
                  <Button size="sm" variant="outline" onClick={() => onAdjustPlan(signal)}>
                    <Wand2 className="h-3.5 w-3.5" /> Adjust plan
                  </Button>
                ) : null}
                {onSchedule ? (
                  <Button size="sm" variant="default" onClick={() => onSchedule(signal)}>
                    Schedule walkthrough
                  </Button>
                ) : null}
                {onResolve && signal.status === "open" ? (
                  <Button size="sm" variant="soft" onClick={() => onResolve(signal)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </Button>
                ) : null}
                {onIgnore && signal.status === "open" ? (
                  <Button size="sm" variant="ghost" onClick={() => onIgnore(signal)}>
                    Ignore
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ai"
                  disabled={!!signal.acknowledged_at || ackMut.isPending}
                  onClick={() => ackMut.mutate(signal.id)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {signal.acknowledged_at ? "Acknowledged" : ackMut.isPending ? "Saving…" : "Acknowledge"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={adjustMut.isPending}
                  onClick={() => adjustMut.mutate(signal.id)}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {adjustMut.isPending ? "Sending…" : "Ask mentor to adjust plan"}
                </Button>
              </>
            )}
          </div>

          <SignalNotes
            signalId={signal.id}
            audience={audience}
            userId={userId ?? null}
            mentorName={mentorName}
            newcomerName={newcomerName}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
