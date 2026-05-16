"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import { Confetti } from "@/components/shared/Confetti";

interface Props {
  open: boolean;
  taskTitle: string;
  encouragement?: string;
  onClose(): void;
}

const ENCOURAGEMENTS = [
  "Nice — small wins compound.",
  "Another one in the bag. Keep the pace.",
  "Beautiful. The plan adapts around what you finish.",
  "Crisp. Your mentor sees the green checkmark too.",
];

export function TaskCompleteOverlay({
  open,
  taskTitle,
  encouragement,
  onClose,
}: Props) {
  const reduce = useReducedMotion();
  const [trigger, setTrigger] = React.useState(0);
  const [line, setLine] = React.useState<string>(
    encouragement ?? ENCOURAGEMENTS[0],
  );

  React.useEffect(() => {
    if (!open) return;
    const t1 = window.setTimeout(() => {
      setTrigger((n) => n + 1);
      if (!encouragement) {
        setLine(
          ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
        );
      }
    }, 0);
    const t2 = window.setTimeout(onClose, 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [open, onClose, encouragement]);

  if (!open) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <Confetti trigger={trigger} count={64} />
      <motion.div
        initial={reduce ? false : { scale: 0.7, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="relative w-full max-w-md rounded-3xl bg-[color:var(--color-surface)] p-8 text-center shadow-2xl"
      >
        <motion.div
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 14,
            delay: 0.1,
          }}
          className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full ai-gradient text-white shadow-lg shadow-black/10"
        >
          <Check className="h-10 w-10" strokeWidth={3} />
        </motion.div>
        <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-fg)]">
          Task complete!
        </h2>
        <p className="mt-1 text-sm text-[color:var(--color-fg-muted)] line-clamp-2">
          {taskTitle}
        </p>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-primary-soft)] px-3 py-1 text-xs font-medium text-[color:var(--color-primary-active)]">
          <Sparkles className="h-3 w-3" /> {line}
        </p>
      </motion.div>
    </motion.div>
  );
}
