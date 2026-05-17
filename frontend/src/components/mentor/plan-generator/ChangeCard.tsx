"use client";

import * as React from "react";
import {
  ArrowRightCircle,
  Check,
  FileDiff,
  GitBranchPlus,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
  Wand2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PlanAdjustmentSuggestedChange } from "@/types";

const ACTION_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  add_task: { label: "Add task", icon: Plus, tone: "text-emerald-700 bg-emerald-500/10" },
  add: { label: "Add task", icon: Plus, tone: "text-emerald-700 bg-emerald-500/10" },
  update_task_field: { label: "Modify task", icon: Pencil, tone: "text-sky-700 bg-sky-500/10" },
  replace_task: { label: "Rewrite task", icon: FileDiff, tone: "text-violet-700 bg-violet-500/10" },
  delete_task: { label: "Remove task", icon: Trash2, tone: "text-rose-700 bg-rose-500/10" },
  add_period: { label: "Add period", icon: GitBranchPlus, tone: "text-orange-700 bg-orange-500/10" },
  adjust_remaining_period: { label: "Adjust remaining", icon: Wand2, tone: "text-amber-700 bg-amber-500/10" },
};

const DEFERRABLE_ACTIONS = new Set(["add_task", "add", "replace_task"]);
const EDITABLE_OVERRIDE_FIELDS = ["title", "description", "reason", "day_number", "week_number"] as const;

export interface ChangeCardProps {
  change: PlanAdjustmentSuggestedChange;
  index: number;
  accepted: boolean;
  editing: boolean;
  overrides: Partial<PlanAdjustmentSuggestedChange>;
  deferredToPlanId?: number | string | null;
  nextPeriodLabel?: string | null;
  nextPeriodPlanId?: number | string | null;
  onToggleAccept: (accepted: boolean) => void;
  onToggleEdit: (editing: boolean) => void;
  onChangeOverrides: (overrides: Partial<PlanAdjustmentSuggestedChange>) => void;
  onDefer: (planId: number | string) => void;
  onUndefer: () => void;
  onReset: () => void;
}

export function ChangeCard({
  change,
  index,
  accepted,
  editing,
  overrides,
  deferredToPlanId,
  nextPeriodLabel,
  nextPeriodPlanId,
  onToggleAccept,
  onToggleEdit,
  onChangeOverrides,
  onDefer,
  onUndefer,
  onReset,
}: ChangeCardProps) {
  const meta = ACTION_META[change.action] ?? ACTION_META.update_task_field;
  const Icon = meta.icon;

  const merged: PlanAdjustmentSuggestedChange = { ...change, ...overrides };
  const isDeferrable = DEFERRABLE_ACTIONS.has(change.action) && nextPeriodPlanId != null;
  const isEdited = EDITABLE_OVERRIDE_FIELDS.some((f) => overrides[f] !== undefined);
  const isDeferred = deferredToPlanId != null;

  return (
    <article
      className={cn(
        "rounded-xl border border-[color:var(--color-border)] bg-white p-4 shadow-sm transition",
        !accepted && "opacity-60",
        isDeferred && "ring-1 ring-orange-400/40",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.tone)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              Change {index + 1}
            </span>
            <Badge tone="neutral" size="sm">
              {meta.label}
            </Badge>
            {change.task_id ? (
              <Badge tone="ai" size="sm">
                task #{change.task_id}
              </Badge>
            ) : null}
            {isEdited ? (
              <Badge tone="ai" size="sm" className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Edited
              </Badge>
            ) : null}
            {isDeferred ? (
              <Badge tone="warning" size="sm" className="inline-flex items-center gap-1">
                <ArrowRightCircle className="h-3 w-3" /> Deferred
              </Badge>
            ) : null}

            <label className="ml-auto inline-flex items-center gap-2 text-xs font-medium text-[color:var(--color-fg-muted)]">
              <Checkbox
                checked={accepted}
                onCheckedChange={(v) => onToggleAccept(v === true)}
                aria-label={accepted ? "Reject this change" : "Accept this change"}
              />
              <span>{accepted ? "Apply" : "Skip"}</span>
            </label>
          </div>

          {editing ? (
            <ChangeEditor
              initial={merged}
              base={change}
              onCancel={() => onToggleEdit(false)}
              onSave={(next) => {
                onChangeOverrides(next);
                onToggleEdit(false);
              }}
            />
          ) : (
            <ChangeView merged={merged} fallbackLabel={meta.label} accepted={accepted} />
          )}

          {!editing ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => onToggleEdit(true)}
                disabled={!accepted}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>

              {isDeferrable ? (
                isDeferred ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={onUndefer}
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Undo defer
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={() => nextPeriodPlanId != null && onDefer(nextPeriodPlanId)}
                        disabled={!accepted}
                      >
                        <ArrowRightCircle className="h-3.5 w-3.5" /> Defer to next period
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Move this new task to {nextPeriodLabel ?? "the next period"} instead of the current one.
                    </TooltipContent>
                  </Tooltip>
                )
              ) : DEFERRABLE_ACTIONS.has(change.action) && nextPeriodPlanId == null ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                        disabled
                      >
                        <ArrowRightCircle className="h-3.5 w-3.5" /> Defer to next period
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>No follow-up period exists for this plan yet.</TooltipContent>
                </Tooltip>
              ) : null}

              {isEdited || isDeferred ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs text-[color:var(--color-fg-muted)]"
                  onClick={onReset}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ChangeView({
  merged,
  fallbackLabel,
  accepted,
}: {
  merged: PlanAdjustmentSuggestedChange;
  fallbackLabel: string;
  accepted: boolean;
}) {
  return (
    <>
      <h4
        className={cn(
          "mt-1 text-sm font-semibold text-[color:var(--color-fg)]",
          !accepted && "line-through",
        )}
      >
        {merged.title || fallbackLabel}
      </h4>
      {merged.description ? (
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
          {merged.description}
        </p>
      ) : null}
      {merged.reason ? (
        <div className="mt-3 rounded-lg bg-[color:var(--color-surface-muted)] px-3 py-2 text-xs text-[color:var(--color-fg-muted)]">
          {merged.reason}
        </div>
      ) : null}
    </>
  );
}

interface EditorDraft {
  title: string;
  description: string;
  reason: string;
  week_number: number | null;
  day_number: number | null;
}

function ChangeEditor({
  initial,
  base,
  onCancel,
  onSave,
}: {
  initial: PlanAdjustmentSuggestedChange;
  base: PlanAdjustmentSuggestedChange;
  onCancel: () => void;
  onSave: (overrides: Partial<PlanAdjustmentSuggestedChange>) => void;
}) {
  const [draft, setDraft] = React.useState<EditorDraft>(() => ({
    title: initial.title ?? "",
    description: initial.description ?? "",
    reason: initial.reason ?? "",
    week_number: initial.week_number ?? null,
    day_number: initial.day_number ?? null,
  }));

  const commit = () => {
    const next: Partial<PlanAdjustmentSuggestedChange> = {};
    if (draft.title !== (base.title ?? "")) next.title = draft.title || undefined;
    if (draft.description !== (base.description ?? ""))
      next.description = draft.description || null;
    if (draft.reason !== (base.reason ?? "")) next.reason = draft.reason || null;
    if (draft.week_number !== (base.week_number ?? null)) next.week_number = draft.week_number;
    if (draft.day_number !== (base.day_number ?? null)) next.day_number = draft.day_number;
    onSave(next);
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          Title
        </label>
        <Input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder={base.title ?? "Change title"}
        />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          Description
        </label>
        <Textarea
          rows={3}
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          placeholder={base.description ?? "What should this change do?"}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            Week
          </label>
          <Input
            type="number"
            min={1}
            max={20}
            value={draft.week_number ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                week_number: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            Day
          </label>
          <Input
            type="number"
            min={1}
            max={7}
            value={draft.day_number ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                day_number: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          Reason / notes
        </label>
        <Textarea
          rows={2}
          value={draft.reason}
          onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
          placeholder={base.reason ?? "Why this change?"}
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5" /> Cancel
        </Button>
        <Button variant="ai" size="sm" onClick={commit}>
          <Check className="h-3.5 w-3.5" /> Save edits
        </Button>
      </div>
    </div>
  );
}
