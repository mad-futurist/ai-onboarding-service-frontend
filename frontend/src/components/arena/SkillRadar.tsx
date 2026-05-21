"use client";

import * as React from "react";
import { motion } from "framer-motion";

import type { ArenaRadarDimension, ArenaRadarScores } from "@/types";

const ORDER: ArenaRadarDimension[] = [
  "opening",
  "discovery",
  "objections",
  "closing",
  "product_knowledge",
];

const LABEL: Record<ArenaRadarDimension, string> = {
  opening: "Opening",
  discovery: "Discovery",
  objections: "Objections",
  closing: "Closing",
  product_knowledge: "Product",
};

interface SkillRadarProps {
  scores: ArenaRadarScores;
  size?: number;
  showLabels?: boolean;
  showValues?: boolean;
  className?: string;
  animate?: boolean;
}

export function SkillRadar({
  scores,
  size = 320,
  showLabels = true,
  showValues = true,
  className,
  animate = true,
}: SkillRadarProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.72;
  const labelRadius = (size / 2) * 0.92;
  const n = ORDER.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const vertex = (i: number, frac: number) => {
    const a = angle(i);
    return {
      x: center + Math.cos(a) * radius * frac,
      y: center + Math.sin(a) * radius * frac,
    };
  };

  const labelPos = (i: number) => {
    const a = angle(i);
    return {
      x: center + Math.cos(a) * labelRadius,
      y: center + Math.sin(a) * labelRadius,
    };
  };

  const rings = [0.25, 0.5, 0.75, 1];

  const targetPoints = ORDER.map((dim, i) => {
    const value = Math.max(0, Math.min(100, scores[dim] ?? 0)) / 100;
    const { x, y } = vertex(i, value);
    return `${x},${y}`;
  }).join(" ");

  const initialPoints = ORDER.map((_, i) => {
    const { x, y } = vertex(i, 0);
    return `${x},${y}`;
  }).join(" ");

  const gradId = React.useId();

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Skill radar"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-ai-from, #8b5cf6)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--color-ai-to, #3b82f6)" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* concentric rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={ORDER.map((_, i) => {
            const { x, y } = vertex(i, r);
            return `${x},${y}`;
          }).join(" ")}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={1}
          opacity={0.7}
        />
      ))}

      {/* axis lines */}
      {ORDER.map((_, i) => {
        const { x, y } = vertex(i, 1);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={0.5}
          />
        );
      })}

      {/* filled polygon (animated) */}
      <motion.polygon
        points={initialPoints}
        animate={{ points: targetPoints } as { points: string }}
        transition={animate ? { type: "spring", stiffness: 60, damping: 16 } : { duration: 0 }}
        fill={`url(#${gradId})`}
        fillOpacity={0.55}
        stroke={`url(#${gradId})`}
        strokeWidth={2}
      />

      {/* vertices */}
      {ORDER.map((dim, i) => {
        const value = Math.max(0, Math.min(100, scores[dim] ?? 0)) / 100;
        const { x, y } = vertex(i, value);
        return (
          <motion.circle
            key={`vertex-${dim}`}
            cx={center}
            cy={center}
            initial={{ r: 0 }}
            animate={{ cx: x, cy: y, r: 4 }}
            transition={animate ? { type: "spring", stiffness: 60, damping: 16, delay: 0.15 } : { duration: 0 }}
            fill="white"
            stroke="var(--color-primary)"
            strokeWidth={2}
          />
        );
      })}

      {/* labels */}
      {showLabels
        ? ORDER.map((dim, i) => {
            const { x, y } = labelPos(i);
            const value = Math.round(scores[dim] ?? 0);
            const isRight = Math.cos(angle(i)) > 0.1;
            const isLeft = Math.cos(angle(i)) < -0.1;
            const anchor = isRight ? "start" : isLeft ? "end" : "middle";
            return (
              <g key={`label-${dim}`}>
                <text
                  x={x}
                  y={y - 3}
                  textAnchor={anchor}
                  className="fill-[color:var(--color-fg)] text-[11px] font-semibold"
                >
                  {LABEL[dim]}
                </text>
                {showValues ? (
                  <text
                    x={x}
                    y={y + 10}
                    textAnchor={anchor}
                    className="fill-[color:var(--color-fg-muted)] text-[10px] tabular-nums"
                  >
                    {value}
                  </text>
                ) : null}
              </g>
            );
          })
        : null}
    </svg>
  );
}
