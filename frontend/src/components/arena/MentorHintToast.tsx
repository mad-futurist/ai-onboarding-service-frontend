"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

import type { ActiveHint } from "@/hooks/use-arena-session";

interface MentorHintToastProps {
  hints: ActiveHint[];
  onDismiss: (id: number) => void;
}

export function MentorHintToast({ hints, onDismiss }: MentorHintToastProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-3">
      <AnimatePresence>
        {hints.map((hint) => (
          <motion.div
            key={hint.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="pointer-events-auto flex max-w-md items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 shadow-lg"
          >
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                Mentor hint
              </div>
              <div className="leading-snug">{hint.text}</div>
            </div>
            <button
              onClick={() => onDismiss(hint.id)}
              className="rounded p-0.5 text-amber-700 hover:bg-amber-100"
              aria-label="Dismiss hint"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
