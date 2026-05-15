"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Wand2, Loader2, AlertCircle, ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { regeneratePlan } from "@/services/plans";
import { toApiError } from "@/lib/api";
import type { AISignal, ID } from "@/types";

interface AdjustPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signal: AISignal | null;
  planId: ID | null;
  newcomerName?: string;
}

export function AdjustPlanDialog({
  open,
  onOpenChange,
  signal,
  planId,
  newcomerName,
}: AdjustPlanDialogProps) {
  const qc = useQueryClient();
  const [notes, setNotes] = React.useState("");
  const [preserveEdits, setPreserveEdits] = React.useState(true);
  const [syncedSignalId, setSyncedSignalId] = React.useState<ID | null>(null);

  // Pre-fill notes from the signal when it opens for a new signal.
  if (signal && signal.id !== syncedSignalId) {
    setSyncedSignalId(signal.id);
    setNotes(buildPrefillFromSignal(signal));
  }
  if (!open && syncedSignalId !== null) {
    // reset on close
    setTimeout(() => setSyncedSignalId(null), 0);
  }

  const regenMut = useMutation({
    mutationFn: () => {
      if (!planId) throw new Error("No plan to adjust");
      return regeneratePlan(planId, {
        scope: "plan",
        preserve_manual_edits: preserveEdits,
        mentor_notes: notes.trim() || undefined,
      });
    },
    onSuccess: (resp) => {
      toast.success("Plan adjusted", {
        description: `${resp.affected_task_ids.length} tasks updated${resp.used_fallback ? " (fallback)" : ""}.`,
      });
      qc.invalidateQueries({ queryKey: ["plan", planId] });
      qc.invalidateQueries({ queryKey: ["plan-weeks", planId] });
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      onOpenChange(false);
    },
    onError: (err) =>
      toast.error("Couldn't adjust plan", { description: toApiError(err).message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-[color:var(--color-primary)]" /> Adjust the plan with AI
          </DialogTitle>
          <DialogDescription>
            The AI re-drafts the plan with your steering notes.
            {newcomerName ? (
              <>
                {" "}
                Target: <span className="font-medium">{newcomerName}</span>.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {!planId ? (
          <div className="flex items-start gap-2 rounded-lg border border-[color:var(--color-warning-soft)] bg-[color:var(--color-warning-soft)] p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-warning-fg)]" />
            <div>
              <p className="font-medium text-[color:var(--color-warning-fg)]">
                No active plan yet
              </p>
              <p className="mt-0.5 text-[color:var(--color-fg-muted)]">
                Generate a plan first, then come back here to adjust it from any signal.
              </p>
              <Button asChild size="sm" variant="ai" className="mt-2">
                <Link href="/mentor/plan-generator">
                  Open plan generator <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {signal ? (
              <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/60 p-3 text-xs">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  <Sparkles className="h-3 w-3 text-[color:var(--color-primary)]" /> Signal context
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge tone="ai" size="sm">
                    {signal.signal_type}
                  </Badge>
                  <span className="font-medium text-[color:var(--color-fg)]">{signal.title}</span>
                </div>
                {signal.description ? (
                  <p className="mt-1 text-[color:var(--color-fg-muted)]">{signal.description}</p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="adjust-notes">Steering notes for the AI</Label>
              <Textarea
                id="adjust-notes"
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What should the AI change about the current plan?"
              />
              <p className="text-[11px] text-[color:var(--color-fg-subtle)]">
                Be specific. The signal&apos;s evidence is pre-filled — adjust as needed.
              </p>
            </div>

            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={preserveEdits}
                onCheckedChange={(v) => setPreserveEdits(v === true)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Preserve manual edits</span>
                <span className="block text-xs text-[color:var(--color-fg-muted)]">
                  Tasks/fields you&apos;ve edited by hand stay untouched. Uncheck for a full rewrite.
                </span>
              </span>
            </label>
          </>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="ai"
            disabled={!planId || regenMut.isPending}
            onClick={() => regenMut.mutate()}
          >
            {regenMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {regenMut.isPending ? "Adjusting…" : "Adjust plan with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildPrefillFromSignal(signal: AISignal): string {
  const parts: string[] = [];
  parts.push(`Address the signal "${signal.title}" (severity: ${signal.severity}).`);
  if (signal.description) parts.push(signal.description);
  if (signal.suggested_action) parts.push(`Suggested action: ${signal.suggested_action}`);
  if (signal.evidence) parts.push(`Evidence:\n${signal.evidence}`);
  return parts.join("\n\n");
}
