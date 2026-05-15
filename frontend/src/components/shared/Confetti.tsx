"use client";

import * as React from "react";

interface ConfettiProps {
  trigger?: unknown;
  count?: number;
  className?: string;
}

interface Piece {
  cx: number;
  cr: number;
  left: number;
  delay: number;
  color: string;
}

const COLORS = [
  "#F97316",
  "#EC4899",
  "#8B5CF6",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
];

export function Confetti({ trigger, count = 48, className }: ConfettiProps) {
  const [pieces, setPieces] = React.useState<Piece[]>([]);

  React.useEffect(() => {
    if (trigger === undefined || trigger === 0) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const next: Piece[] = Array.from({ length: count }).map((_, i) => ({
      cx: (Math.random() - 0.5) * 360,
      cr: 180 + Math.random() * 540,
      left: 50 + (Math.random() - 0.5) * 30,
      delay: Math.random() * 0.15,
      color: COLORS[i % COLORS.length],
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(next);
    const t = window.setTimeout(() => setPieces([]), 1500);
    return () => window.clearTimeout(t);
  }, [trigger, count]);

  if (pieces.length === 0) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: "0",
            background: p.color,
            animationDelay: `${p.delay}s`,
            ["--cx" as never]: `${p.cx}px`,
            ["--cr" as never]: `${p.cr}deg`,
          }}
        />
      ))}
    </div>
  );
}
