"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Layers,
  ListPlus,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ID, PlanRegenerateRequest, Week } from "@/types";

interface RegenerateScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weeks: Week[];
  pending: boolean;
  onSubmit: (payload: PlanRegenerateRequest) => void;
}

type Scope = "plan" | "week" | "add_tasks";

const SCOPE_META: Record<
  Scope,
  { title: string; subtitle: string; icon: React.ReactNode; accent: "ai" | "warning" | "info" }
> = {
  plan: {
    title: "Whole period",
    subtitle: "Rebuild every week and task in this period",
    icon: <Layers className="h-5 w-5" />,
    accent: "ai",
  },
  week: {
    title: "Just one week",
    subtitle: "Pivot a single week mid-period",
    icon: <RefreshCcw className="h-5 w-5" />,
    accent: "warning",
  },
  add_tasks: {
    title: "Add new tasks",
    subtitle: "Insert tasks without touching existing ones",
    icon: <ListPlus className="h-5 w-5" />,
    accent: "info",
  },
};

export function RegenerateScopeDialog({
  open,
  onOpenChange,
  weeks,
  pending,
  onSubmit,
}: RegenerateScopeDialogProps) {
  const [scope, setScope] = React.useState<Scope>("plan");
  const [weekId, setWeekId] = React.useState<ID | null>(null);
  const [notes, setNotes] = React.useState("");
  const [preserve, setPreserve] = React.useState(true);
  const [versioned, setVersioned] = React.useState(true);
  const [addCount, setAddCount] = React.useState(2);

  React.useEffect(() => {
    if (!open) return;
    setScope("plan");
    setWeekId(weeks[0]?.id ?? null);
    setNotes("");
    setPreserve(true);
    setVersioned(true);
    setAddCount(2);
  }, [open, weeks]);

  const handleSubmit = () => {
    const payload: PlanRegenerateRequest = {
      scope: scope === "add_tasks" ? "add_tasks" : scope,
      preserve_manual_edits: preserve,
      mentor_notes: notes.trim() || undefined,
      create_new_version: versioned,
    };
    if (scope === "week") {
      payload.target_id = weekId;
    } else if (scope === "add_tasks") {
      payload.add_tasks_count = addCount;
      payload.add_tasks_week_id = weekId;
    }
    onSubmit(payload);
  };

  const canSubmit =
    scope === "plan" ||
    (scope === "week" && !!weekId) ||
    (scope === "add_tasks" && addCount > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg ai-gradient text-white shadow-[var(--shadow-ai)]">
              <Wand2 className="h-3.5 w-3.5" />
            </span>
            Regenerate with AI
          </DialogTitle>
          <DialogDescription>
            Pick a scope. The wider the scope, the more the AI will redo.
          </DialogDescription>
        </DialogHeader>

        {/* Scope picker */}
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.entries(SCOPE_META) as [Scope, (typeof SCOPE_META)[Scope]][]).map(
            ([key, meta]) => {
              const active = scope === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScope(key)}
                  className={cn(
                    "group relative rounded-2xl border p-3 text-left transition-all",
                    active
                      ? "border-[color:var(--color-primary-ring)] ring-2 ring-[color:var(--color-primary-ring)] shadow-[var(--shadow-ai)] bg-white"
                      : "border-[color:var(--color-border)] bg-white hover:-translate-y-0.5 hover:border-[color:var(--color-primary-ring)]",
                  )}
                >
                  <div
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg text-white shadow-sm",
                      meta.accent === "ai" && "ai-gradient",
                      meta.accent === "warning" && "bg-[color:var(--color-warning)]",
                      meta.accent === "info" && "bg-[color:var(--color-info)]",
                    )}
                  >
                    {meta.icon}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[color:var(--color-fg)]">{meta.title}</div>
                  <div className="text-[11px] text-[color:var(--color-fg-muted)]">{meta.subtitle}</div>
                  {active ? (
                    <motion.span
                      layoutId="scope-active"
                      className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-primary-active)]"
                    >
                      <Sparkles className="h-3 w-3" /> Selected
                    </motion.span>
                  ) : null}
                </button>
              );
            },
          )}
        </div>

        {/* Scope-specific controls */}
        {scope === "week" || scope === "add_tasks" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">Week</Label>
              <Select
                value={weekId != null ? String(weekId) : ""}
                onValueChange={(v) => setWeekId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a week" />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      Week {w.index} · {w.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {scope === "add_tasks" ? (
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider">How many tasks</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={addCount}
                  onChange={(e) => setAddCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Steering notes */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider">
            Steering notes (optional)
          </Label>
          <Textarea
            rows={3}
            value={notes}
            placeholder={
              scope === "add_tasks"
                ? "e.g. Add 2 tasks about Kubernetes basics."
                : scope === "week"
                  ? "e.g. Lighten this week — she has 3 onboarding meetings."
                  : "e.g. Shift more focus to deployment in the first two weeks."
            }
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="grid gap-2 sm:grid-cols-2">
          <CheckRow
            checked={preserve}
            onCheckedChange={setPreserve}
            label="Preserve my manual edits"
            hint="The AI will leave fields you tweaked alone."
            icon={<Target className="h-3.5 w-3.5" />}
          />
          <CheckRow
            checked={versioned}
            onCheckedChange={setVersioned}
            label="Save as new version"
            hint="Keeps the current state for the diff viewer."
            icon={<GitBranch className="h-3.5 w-3.5" />}
          />
        </div>

        {scope === "plan" ? (
          <div className="rounded-xl border border-[color:var(--color-warning-soft)] bg-[color:var(--color-warning-soft)] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-warning-fg)]">
              Heads up
            </div>
            <p className="mt-1 text-xs text-[color:var(--color-fg)]">
              Regenerating the whole period rewrites every week and task. Approved manual edits are preserved when the option above is on.
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="ai" disabled={!canSubmit || pending} onClick={handleSubmit}>
            {pending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Regenerating…
              </>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5" /> Regenerate{" "}
                <Badge tone="neutral" size="sm" className="ml-1 bg-white/20 text-white">
                  {scope === "plan" ? "period" : scope === "week" ? "week" : `+${addCount} tasks`}
                </Badge>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckRow({
  checked,
  onCheckedChange,
  label,
  hint,
  icon,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--color-border)] bg-white p-3 transition hover:border-[color:var(--color-primary-ring)]">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(Boolean(v))} className="mt-0.5" />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-fg)]">
          {icon}
          {label}
        </div>
        <div className="text-[11px] text-[color:var(--color-fg-muted)]">{hint}</div>
      </div>
    </label>
  );
}
