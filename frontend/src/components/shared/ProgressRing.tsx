"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn, clamp } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  tone?: "ai" | "brand" | "success" | "neutral";
  showValue?: boolean;
  label?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 48,
  stroke = 5,
  tone = "ai",
  showValue = false,
  label,
  className,
}: ProgressRingProps) {
  const reduced = useReducedMotion();
  const pct = clamp((value / max) * 100, 0, 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const gradientId = React.useId();

  const strokeColor = (() => {
    switch (tone) {
      case "ai":
        return `url(#${gradientId})`;
      case "brand":
        return "var(--color-primary)";
      case "success":
        return "var(--color-success)";
      case "neutral":
        return "var(--color-fg)";
    }
  })();

  return (
    <div className={cn("relative inline-grid place-items-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {tone === "ai" ? (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-ai-from)" />
              <stop offset="55%" stopColor="var(--color-ai-via)" />
              <stop offset="100%" stopColor="var(--color-ai-to)" />
            </linearGradient>
          </defs>
        ) : null}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-muted)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {(showValue || label) && (
        <div className="absolute inset-0 grid place-items-center text-center leading-none">
          {showValue ? (
            <div className="text-[11px] font-semibold tabular-nums text-[color:var(--color-fg)]">
              {Math.round(pct)}%
            </div>
          ) : null}
          {label ? <div className="text-[10px] text-[color:var(--color-fg-muted)]">{label}</div> : null}
        </div>
      )}
    </div>
  );
}
