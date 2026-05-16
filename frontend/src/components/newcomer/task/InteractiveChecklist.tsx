"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ClipboardCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  items: string[];
  taskId: number;
  onProgressChange?(ratio: number, checkedCount: number): void;
}

function storageKey(taskId: number) {
  return `onbord.task.checklist.${taskId}`;
}

export function InteractiveChecklist({ items, taskId, onProgressChange }: Props) {
  const reduce = useReducedMotion();
  const [checked, setChecked] = React.useState<Set<number>>(new Set());

  // Restore from localStorage on mount (per-task)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(storageKey(taskId));
        if (raw) {
          const arr = JSON.parse(raw) as number[];
          setChecked(new Set(arr.filter((n) => Number.isFinite(n))));
        }
      } catch {
        /* noop */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [taskId]);

  // Persist + notify parent
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      storageKey(taskId),
      JSON.stringify(Array.from(checked)),
    );
    const total = Math.max(items.length, 1);
    const ratio = items.length ? checked.size / total : 0;
    onProgressChange?.(ratio, checked.size);
  }, [checked, items.length, onProgressChange, taskId]);

  const toggle = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-[color:var(--color-primary)]" />
              Acceptance criteria
            </CardTitle>
            <CardDescription>
              Tick them off as you go — it helps you (and your mentor) see progress.
            </CardDescription>
          </div>
          {items.length ? (
            <span className="rounded-full bg-[color:var(--color-primary-soft)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[color:var(--color-primary-active)]">
              {checked.size}/{items.length}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          <>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
              <motion.div
                className="h-full rounded-full ai-gradient"
                initial={false}
                animate={{
                  width: `${(checked.size / items.length) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
              />
            </div>
            <ul className="space-y-2">
              {items.map((item, idx) => {
                const isChecked = checked.has(idx);
                return (
                  <li key={`${item}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-pressed={isChecked}
                      className={cn(
                        "group w-full text-left flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-all",
                        isChecked
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/30",
                      )}
                    >
                      <motion.span
                        layout={!reduce}
                        animate={
                          reduce
                            ? undefined
                            : {
                                scale: isChecked ? [1, 1.15, 1] : 1,
                              }
                        }
                        transition={{ duration: 0.32, ease: "easeOut" }}
                        className={cn(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                          isChecked
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-[color:var(--color-border-strong)] bg-white text-transparent group-hover:border-[color:var(--color-primary)]",
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </motion.span>
                      <span
                        className={cn(
                          "text-sm leading-relaxed transition-colors",
                          isChecked
                            ? "text-[color:var(--color-fg-muted)] line-through decoration-emerald-600/60"
                            : "text-[color:var(--color-fg)]",
                        )}
                      >
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-[color:var(--color-border)] px-4 py-5 text-center text-sm text-[color:var(--color-fg-muted)]">
            No acceptance criteria yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
