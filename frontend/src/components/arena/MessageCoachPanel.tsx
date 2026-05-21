"use client";

import { motion } from "framer-motion";
import { Heart, Lightbulb, AlertTriangle, MessageSquareQuote } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ArenaMessageCoach } from "@/types";

interface MessageCoachPanelProps {
  loading: boolean;
  data: ArenaMessageCoach | null;
  isSelf?: boolean;
}

export function MessageCoachPanel({ loading, data, isSelf }: MessageCoachPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "mt-1 overflow-hidden",
        isSelf ? "flex justify-end" : "flex justify-start",
      )}
    >
      <div className="w-full max-w-md rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
          AI Coach
        </div>
        {loading ? (
          <div className="mt-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ) : data ? (
          <div className="mt-1.5 space-y-2.5 text-sm">
            <div className="font-semibold text-[color:var(--color-fg)]">
              {data.headline}
            </div>

            {data.sender === "client" && data.emotion_read ? (
              <div className="flex gap-2 rounded-lg bg-rose-50 p-2 text-rose-900">
                <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                <div className="text-[12.5px] leading-snug">{data.emotion_read}</div>
              </div>
            ) : null}

            {data.sender === "newcomer" && data.better_response ? (
              <div className="flex gap-2 rounded-lg bg-emerald-50 p-2 text-emerald-900">
                <MessageSquareQuote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    Stronger reply
                  </div>
                  <div className="mt-0.5 text-[12.5px] leading-snug">
                    &ldquo;{data.better_response}&rdquo;
                  </div>
                </div>
              </div>
            ) : null}

            {data.relationship_moves.length ? (
              <div>
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                  <Lightbulb className="h-3 w-3" />{" "}
                  {data.sender === "client" ? "Relationship moves" : "Coach moves"}
                </div>
                <ul className="mt-1 space-y-1">
                  {data.relationship_moves.map((m, i) => (
                    <li key={i} className="text-[12.5px] leading-snug">
                      <span className="font-medium">{m.title}</span>
                      <span className="text-[color:var(--color-fg-muted)]"> — {m.body}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.watch_out_for ? (
              <div className="flex gap-2 rounded-lg bg-amber-50 p-2 text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <div className="text-[12.5px] leading-snug">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Watch out
                  </span>
                  <div>{data.watch_out_for}</div>
                </div>
              </div>
            ) : null}

            <div className="text-[10px] text-[color:var(--color-fg-subtle)]">
              Skill focus · {data.skill_focus.replace("_", " ")}
            </div>
          </div>
        ) : (
          <div className="text-xs text-[color:var(--color-fg-muted)]">
            Could not load coach insight. Try again.
          </div>
        )}
      </div>
    </motion.div>
  );
}
