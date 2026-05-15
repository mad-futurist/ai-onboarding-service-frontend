"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface YouTubeEmbedProps {
  url: string | null | undefined;
  title?: string;
  className?: string;
}

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const match = trimmed.match(YOUTUBE_ID_REGEX);
  if (match?.[1]) return match[1];
  // Fallback: raw ID (11 chars typical)
  if (/^[A-Za-z0-9_-]{10,15}$/.test(trimmed)) return trimmed;
  return null;
}

export function YouTubeEmbed({ url, title, className }: YouTubeEmbedProps) {
  const reduced = useReducedMotion();
  const id = extractYouTubeId(url);

  if (!id) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3 text-xs text-[color:var(--color-fg-muted)]",
          className,
        )}
      >
        <PlayCircle className="h-4 w-4" />
        Invalid YouTube URL
      </div>
    );
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn("ai-border rounded-2xl", className)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-black shadow-[var(--shadow-elevated)]">
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${id}?rel=0`}
            title={title ?? "YouTube video"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </motion.div>
  );
}
