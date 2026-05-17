"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { CountUp } from "@/components/shared/CountUp";
import { useLocale } from "@/providers/locale-provider";
import { summarizePulse } from "./derive";
import type { MentorDashboardResponse } from "@/types";

interface AIPulseStripProps {
  data: MentorDashboardResponse | undefined;
  isDemo?: boolean;
}

export function AIPulseStrip({ data, isDemo = true }: AIPulseStripProps) {
  const { t } = useLocale();
  const pulse = summarizePulse(data, isDemo);

  if (pulse.isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
        className="relative mt-4 flex items-center gap-2 text-xs text-[color:var(--color-fg-muted)]"
      >
        <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
        <span>{t("mentor.dash.pulse.fallback")}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
      className="relative mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--color-fg-muted)]"
    >
      <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
      <span className="text-[color:var(--color-fg)]">
        <span className="font-semibold text-[color:var(--color-primary-active)]">
          <CountUp value={pulse.sigCount} />
        </span>{" "}
        signals
      </span>
      <PulseDot delay={0} />
      <span className="text-[color:var(--color-fg)]">
        <span className="font-semibold text-[color:var(--color-primary-active)]">
          <CountUp value={pulse.draftCount} />
        </span>{" "}
        drafts
      </span>
      <PulseDot delay={0.4} />
      <span className="text-[color:var(--color-fg)]">
        <span className="font-semibold text-[color:var(--color-primary-active)]">
          <CountUp value={pulse.hours} decimals={pulse.hours % 1 === 0 ? 0 : 1} />
          h
        </span>{" "}
        saved
      </span>
      <span className="ml-1 hidden text-[color:var(--color-fg-faint)] sm:inline">
        · last 24h
      </span>
    </motion.div>
  );
}

function PulseDot({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-flex h-1 w-1 items-center justify-center"
    >
      <span
        className="absolute inset-0 rounded-full bg-[color:var(--color-primary)] animate-[signal-pulse_2.4s_ease-in-out_infinite] motion-reduce:animate-none"
        style={{ animationDelay: `${delay}s` }}
      />
      <span className="relative inline-block h-1 w-1 rounded-full bg-[color:var(--color-primary)]" />
    </span>
  );
}
