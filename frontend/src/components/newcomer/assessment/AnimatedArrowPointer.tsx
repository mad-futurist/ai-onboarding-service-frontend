"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  className?: string;
  /** Direction the arrow points to. Defaults to "right". */
  direction?: "right" | "down" | "down-right";
}

export function AnimatedArrowPointer({
  className,
  direction = "down-right",
}: Props) {
  const reduceMotion = useReducedMotion();

  const axis =
    direction === "right" ? { x: [0, 10, 0] } :
    direction === "down" ? { y: [0, 10, 0] } :
    { x: [0, 8, 0], y: [0, 6, 0] };

  const rotate =
    direction === "right" ? 0 :
    direction === "down" ? 90 :
    35;

  return (
    <motion.svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotate}deg)` }}
      animate={reduceMotion ? undefined : axis}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="arrow-grad" x1="0" y1="0" x2="56" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M4 28 Q 18 12, 32 24 T 50 28"
        stroke="url(#arrow-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 22 L 52 28 L 44 34"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.svg>
  );
}
