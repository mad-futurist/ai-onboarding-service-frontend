"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GitBranch, GitCompare, Minus, Pencil, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtDate } from "@/lib/format";
import type { PeriodVersion } from "@/types";

interface VersionDiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: PeriodVersion[];
  onAcceptB?: () => void;
  onRollbackA?: () => void;
}

type DiffMarker = "unchanged" | "added" | "removed" | "modified";

interface DiffRow {
  marker: DiffMarker;
  weekIndex: number;
  weekTitle: string;
  left?: { title: string; description?: string | null; success?: string | null };
  right?: { title: string; description?: string | null; success?: string | null };
}

export function VersionDiffViewer({
  open,
  onOpenChange,
  versions,
  onAcceptB,
  onRollbackA,
}: VersionDiffViewerProps) {
  const sorted = React.useMemo(
    () => [...versions].sort((a, b) => a.version_number - b.version_number),
    [versions],
  );

  const defaultA = sorted[Math.max(0, sorted.length - 2)]?.id ?? sorted[0]?.id ?? null;
  const defaultB = sorted[sorted.length - 1]?.id ?? null;

  const [aId, setAId] = React.useState<number | null>(defaultA ?? null);
  const [bId, setBId] = React.useState<number | null>(defaultB ?? null);

  React.useEffect(() => {
    if (!open) return;
    setAId(defaultA);
    setBId(defaultB);
  }, [open, defaultA, defaultB]);

  const a = sorted.find((v) => v.id === aId);
  const b = sorted.find((v) => v.id === bId);
  const diff = a && b ? computeDiff(a, b) : [];
  const stats = countMarkers(diff);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg ai-gradient text-white shadow-[var(--shadow-ai)]">
              <GitCompare className="h-3.5 w-3.5" />
            </span>
            Compare versions
          </DialogTitle>
          <DialogDescription>
            See what changed between two saved versions of this period.
          </DialogDescription>
        </DialogHeader>

        {/* Version pickers */}
        <div className="grid gap-3 sm:grid-cols-2">
          <VersionPicker label="From (older)" versions={sorted} value={aId} onChange={setAId} />
          <VersionPicker label="To (newer)" versions={sorted} value={bId} onChange={setBId} />
        </div>

        {/* Diff summary */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 text-xs">
          <span className="font-semibold text-[color:var(--color-fg)]">Summary:</span>
          <Badge tone="success" size="sm">
            <Plus className="h-3 w-3" /> {stats.added} added
          </Badge>
          <Badge tone="info" size="sm">
            <Pencil className="h-3 w-3" /> {stats.modified} modified
          </Badge>
          <Badge tone="danger" size="sm">
            <Minus className="h-3 w-3" /> {stats.removed} removed
          </Badge>
          <Badge tone="neutral" size="sm">
            {stats.unchanged} unchanged
          </Badge>
        </div>

        {/* Diff rows */}
        <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
          {diff.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white p-6 text-center text-sm text-[color:var(--color-fg-muted)]">
              No differences between these two versions.
            </div>
          ) : (
            groupByWeek(diff).map((wk) => (
              <div
                key={wk.weekIndex}
                className="overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white"
              >
                <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 text-xs font-semibold text-[color:var(--color-fg)]">
                  Week {wk.weekIndex} · {wk.weekTitle}
                </div>
                <div className="divide-y divide-[color:var(--color-border)]">
                  {wk.rows.map((row, i) => (
                    <DiffRowView key={`${row.marker}-${i}`} row={row} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onRollbackA && a && a.id !== b?.id ? (
            <Button variant="outline" onClick={onRollbackA}>
              <GitBranch className="h-3.5 w-3.5" /> Rollback to v{a.version_number}
            </Button>
          ) : null}
          {onAcceptB && b && b.id !== a?.id ? (
            <Button variant="ai" onClick={onAcceptB}>
              Accept v{b.version_number}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VersionPicker({
  label,
  versions,
  value,
  onChange,
}: {
  label: string;
  versions: PeriodVersion[];
  value: number | null;
  onChange: (id: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        {label}
      </div>
      <Select value={value != null ? String(value) : ""} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v.id} value={String(v.id)}>
              v{v.version_number} · {fmtDate(v.created_at)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DiffRowView({ row }: { row: DiffRow }) {
  const meta = MARKER_META[row.marker];
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18 }}
      className="grid grid-cols-2 gap-3 px-3 py-2 text-xs"
    >
      {/* Left side */}
      <div className={cn("rounded-md p-2", row.left ? meta.leftBg : "bg-transparent")}>
        {row.left ? (
          <>
            <div className="flex items-center gap-1.5 text-[color:var(--color-fg)]">
              <span className={meta.leftIconClass}>{meta.leftIcon}</span>
              <span className="font-medium">{row.left.title}</span>
            </div>
            {row.left.description ? (
              <p className="ml-5 mt-1 line-clamp-2 text-[11px] text-[color:var(--color-fg-muted)]">
                {row.left.description}
              </p>
            ) : null}
          </>
        ) : (
          <span className="text-[color:var(--color-fg-faint)]">—</span>
        )}
      </div>
      {/* Right side */}
      <div className={cn("rounded-md p-2", row.right ? meta.rightBg : "bg-transparent")}>
        {row.right ? (
          <>
            <div className="flex items-center gap-1.5 text-[color:var(--color-fg)]">
              <span className={meta.rightIconClass}>{meta.rightIcon}</span>
              <span className="font-medium">{row.right.title}</span>
            </div>
            {row.right.description ? (
              <p className="ml-5 mt-1 line-clamp-2 text-[11px] text-[color:var(--color-fg-muted)]">
                {row.right.description}
              </p>
            ) : null}
          </>
        ) : (
          <span className="text-[color:var(--color-fg-faint)]">—</span>
        )}
      </div>
    </motion.div>
  );
}

const MARKER_META: Record<
  DiffMarker,
  {
    leftBg: string;
    rightBg: string;
    leftIcon: React.ReactNode;
    rightIcon: React.ReactNode;
    leftIconClass: string;
    rightIconClass: string;
  }
> = {
  unchanged: {
    leftBg: "bg-white",
    rightBg: "bg-white",
    leftIcon: <span className="text-[10px] text-[color:var(--color-fg-faint)]">✓</span>,
    rightIcon: <span className="text-[10px] text-[color:var(--color-fg-faint)]">✓</span>,
    leftIconClass: "inline-flex h-3.5 w-3.5 items-center justify-center",
    rightIconClass: "inline-flex h-3.5 w-3.5 items-center justify-center",
  },
  added: {
    leftBg: "bg-white",
    rightBg: "bg-[color:var(--color-success-soft)]",
    leftIcon: <span className="text-[10px] text-[color:var(--color-fg-faint)]">·</span>,
    rightIcon: <Plus className="h-3.5 w-3.5 text-[color:var(--color-success-fg)]" />,
    leftIconClass: "inline-flex h-3.5 w-3.5 items-center justify-center",
    rightIconClass: "",
  },
  removed: {
    leftBg: "bg-[color:var(--color-danger-soft)]",
    rightBg: "bg-white",
    leftIcon: <Minus className="h-3.5 w-3.5 text-[color:var(--color-danger-fg)]" />,
    rightIcon: <span className="text-[10px] text-[color:var(--color-fg-faint)]">·</span>,
    leftIconClass: "",
    rightIconClass: "inline-flex h-3.5 w-3.5 items-center justify-center",
  },
  modified: {
    leftBg: "bg-[color:var(--color-info-soft)]",
    rightBg: "bg-[color:var(--color-info-soft)]",
    leftIcon: <Pencil className="h-3.5 w-3.5 text-[color:var(--color-info-fg)]" />,
    rightIcon: <Pencil className="h-3.5 w-3.5 text-[color:var(--color-info-fg)]" />,
    leftIconClass: "",
    rightIconClass: "",
  },
};

function computeDiff(a: PeriodVersion, b: PeriodVersion): DiffRow[] {
  const rows: DiffRow[] = [];

  const allWeeks = new Map<number, { title: string }>();
  for (const w of a.snapshot.weeks) allWeeks.set(w.index, { title: w.title });
  for (const w of b.snapshot.weeks) {
    if (!allWeeks.has(w.index)) allWeeks.set(w.index, { title: w.title });
  }

  const weekIndexes = Array.from(allWeeks.keys()).sort((x, y) => x - y);

  for (const idx of weekIndexes) {
    const left = a.snapshot.weeks.find((w) => w.index === idx);
    const right = b.snapshot.weeks.find((w) => w.index === idx);
    const weekTitle = right?.title ?? left?.title ?? `Week ${idx}`;

    const leftTasks = left?.tasks ?? [];
    const rightTasks = right?.tasks ?? [];

    const leftByTitle = new Map(leftTasks.map((t) => [normalize(t.title), t]));
    const rightByTitle = new Map(rightTasks.map((t) => [normalize(t.title), t]));

    const seen = new Set<string>();

    for (const lt of leftTasks) {
      const key = normalize(lt.title);
      const rt = rightByTitle.get(key);
      seen.add(key);
      if (!rt) {
        rows.push({
          marker: "removed",
          weekIndex: idx,
          weekTitle,
          left: { title: lt.title, description: lt.description, success: lt.success_criteria },
        });
      } else if (
        lt.description === rt.description &&
        lt.success_criteria === rt.success_criteria &&
        lt.priority === rt.priority
      ) {
        rows.push({
          marker: "unchanged",
          weekIndex: idx,
          weekTitle,
          left: { title: lt.title, description: lt.description, success: lt.success_criteria },
          right: { title: rt.title, description: rt.description, success: rt.success_criteria },
        });
      } else {
        rows.push({
          marker: "modified",
          weekIndex: idx,
          weekTitle,
          left: { title: lt.title, description: lt.description, success: lt.success_criteria },
          right: { title: rt.title, description: rt.description, success: rt.success_criteria },
        });
      }
    }

    for (const rt of rightTasks) {
      const key = normalize(rt.title);
      if (seen.has(key)) continue;
      rows.push({
        marker: "added",
        weekIndex: idx,
        weekTitle,
        right: { title: rt.title, description: rt.description, success: rt.success_criteria },
      });
    }
  }

  return rows;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function groupByWeek(rows: DiffRow[]): { weekIndex: number; weekTitle: string; rows: DiffRow[] }[] {
  const map = new Map<number, { weekIndex: number; weekTitle: string; rows: DiffRow[] }>();
  for (const row of rows) {
    const bucket = map.get(row.weekIndex) ?? { weekIndex: row.weekIndex, weekTitle: row.weekTitle, rows: [] };
    bucket.rows.push(row);
    map.set(row.weekIndex, bucket);
  }
  return Array.from(map.values()).sort((a, b) => a.weekIndex - b.weekIndex);
}

function countMarkers(rows: DiffRow[]) {
  let added = 0;
  let removed = 0;
  let modified = 0;
  let unchanged = 0;
  for (const r of rows) {
    if (r.marker === "added") added += 1;
    else if (r.marker === "removed") removed += 1;
    else if (r.marker === "modified") modified += 1;
    else unchanged += 1;
  }
  return { added, removed, modified, unchanged };
}
