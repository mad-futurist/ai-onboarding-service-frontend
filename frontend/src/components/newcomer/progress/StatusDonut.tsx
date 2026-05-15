"use client";

import * as React from "react";
import { motion } from "framer-motion";

export interface StatusDonutSegment {
  key: string;
  label: string;
  value: number;
  /** Solid CSS color or gradient id reference. */
  color: string;
}

interface StatusDonutProps {
  segments: StatusDonutSegment[];
  size?: number;
  stroke?: number;
  /** Optional content rendered absolutely centered in the ring. */
  center?: React.ReactNode;
}

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * SVG donut chart with one stroked arc per segment.
 * The "done" segment uses the AI gradient — caller passes `url(#donut-ai)`.
 */
export function StatusDonut({
  segments,
  size = 184,
  stroke = 16,
  center,
}: StatusDonutProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(
    segments.reduce((acc, s) => acc + Math.max(s.value, 0), 0),
    1,
  );

  const arcs = segments
    .map((s) => ({
      ...s,
      fraction: Math.max(s.value, 0) / total,
    }))
    .reduce<
      Array<StatusDonutSegment & { dashArray: string; offset: number; fraction: number }>
    >((acc, s) => {
      const cursor = acc.reduce((sum, prev) => sum + prev.fraction, 0);
      const length = s.fraction * circumference;
      acc.push({
        ...s,
        dashArray: `${length} ${circumference - length}`,
        offset: circumference * (1 - cursor),
      });
      return acc;
    }, []);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient id="donut-ai" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-ai-from)" />
            <stop offset="55%" stopColor="var(--color-ai-via)" />
            <stop offset="100%" stopColor="var(--color-ai-to)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-muted)"
          strokeWidth={stroke}
        />
        {arcs.map((arc) => (
          <motion.circle
            key={arc.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.offset}
            initial={
              REDUCED_MOTION
                ? false
                : { strokeDasharray: `0 ${circumference}` }
            }
            animate={{ strokeDasharray: arc.dashArray }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.05,
            }}
          />
        ))}
      </svg>
      {center ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          {center}
        </div>
      ) : null}
    </div>
  );
}
