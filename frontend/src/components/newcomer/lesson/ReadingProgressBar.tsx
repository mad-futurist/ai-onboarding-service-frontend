"use client";

import * as React from "react";

interface ReadingProgressBarProps {
  /** The article element to track scroll progress against. */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Fires once when the user has reached ≥ 95 % and stayed there for ~1.5 s. */
  onReadComplete?: () => void;
  /** Lesson identity — resets the "complete" latch on change. */
  resetKey?: string | number;
}

export function ReadingProgressBar({
  targetRef,
  onReadComplete,
  resetKey,
}: ReadingProgressBarProps) {
  const fillRef = React.useRef<HTMLDivElement | null>(null);
  const completedRef = React.useRef(false);
  const dwellTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    completedRef.current = false;
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
    if (fillRef.current) fillRef.current.style.width = "0%";
  }, [resetKey]);

  React.useEffect(() => {
    let rafId = 0;
    let queued = false;

    const compute = () => {
      queued = false;
      const node = targetRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const totalScrollable = Math.max(rect.height - viewport, 1);
      // How far past the top of the article we've scrolled.
      const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
      const ratio = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
      if (fillRef.current) {
        fillRef.current.style.width = `${ratio * 100}%`;
      }

      if (!completedRef.current && ratio >= 0.95) {
        if (!dwellTimer.current) {
          dwellTimer.current = setTimeout(() => {
            completedRef.current = true;
            dwellTimer.current = null;
            onReadComplete?.();
          }, 1500);
        }
      } else if (ratio < 0.9 && dwellTimer.current) {
        clearTimeout(dwellTimer.current);
        dwellTimer.current = null;
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (dwellTimer.current) {
        clearTimeout(dwellTimer.current);
        dwellTimer.current = null;
      }
    };
  }, [targetRef, onReadComplete]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-px h-[3px] overflow-hidden rounded-t-2xl"
    >
      <div
        ref={fillRef}
        className="ai-gradient h-full transition-[width] duration-150 ease-out"
        style={{ width: "0%" }}
      />
    </div>
  );
}
