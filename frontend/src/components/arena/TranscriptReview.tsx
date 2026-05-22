"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ArenaTranscriptEntry } from "@/types";

const COLOR_RING: Record<string, string> = {
  green: "border-l-emerald-500 bg-emerald-50",
  yellow: "border-l-amber-500 bg-amber-50",
  red: "border-l-rose-500 bg-rose-50",
  neutral: "border-l-stone-300 bg-[color:var(--color-surface)]",
};

const COLOR_LABEL: Record<string, string> = {
  green: "text-emerald-700",
  yellow: "text-amber-700",
  red: "text-rose-700",
  neutral: "text-[color:var(--color-fg-muted)]",
};

interface TranscriptReviewProps {
  transcript: ArenaTranscriptEntry[];
}

export function TranscriptReview({ transcript }: TranscriptReviewProps) {
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const toggle = (id: number) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }));

  if (!transcript.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-[color:var(--color-fg-muted)]">
        No messages to review.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transcript.map((entry) => {
        const isRed = entry.color === "red";
        const isOpen = !!expanded[entry.message_id];
        return (
          <div
            key={entry.message_id}
            className={cn(
              "overflow-hidden rounded-xl border-l-4 border border-[color:var(--color-border)]",
              COLOR_RING[entry.color] ?? COLOR_RING.neutral,
            )}
          >
            <button
              onClick={() => isRed && toggle(entry.message_id)}
              data-demo-id={isRed ? "arena-transcript-red-message" : undefined}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left",
                isRed && "cursor-pointer hover:bg-rose-100/40",
                !isRed && "cursor-default",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider">
                  <span className={COLOR_LABEL[entry.color] ?? COLOR_LABEL.neutral}>
                    {entry.color}
                  </span>
                  {entry.label ? (
                    <span className="ml-2 text-[color:var(--color-fg-muted)] normal-case tracking-normal font-normal">
                      · {entry.label}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-[color:var(--color-fg)]">
                  &ldquo;{entry.content}&rdquo;
                </div>
              </div>
              {isRed ? (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-rose-700 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              ) : null}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && isRed ? (
                <motion.div
                  key="alts"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  data-demo-id="arena-transcript-alternatives"
                  className="overflow-hidden border-t border-rose-200"
                >
                  <div className="space-y-2 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-800">
                      Three alternatives
                    </div>
                    {entry.alternatives.length === 0 ? (
                      <div className="text-xs text-[color:var(--color-fg-muted)]">
                        (No alternatives generated.)
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {entry.alternatives.map((alt, idx) => (
                          <li
                            key={idx}
                            className="rounded-lg border border-rose-200 bg-white p-3 text-sm shadow-sm"
                          >
                            <div className="font-medium">&ldquo;{alt.text}&rdquo;</div>
                            <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                              {alt.why}
                            </div>
                            {alt.citation_title ? (
                              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
                                <BookOpen className="h-3 w-3" />
                                {alt.citation_title}
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
