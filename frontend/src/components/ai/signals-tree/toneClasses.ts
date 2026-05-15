import type { AISignal } from "@/types";
import { inferSignalTone } from "@/lib/constants";

export type Tone = "positive" | "attention" | "critical";

export function toneOf(s: AISignal): Tone {
  return inferSignalTone(s);
}

export const TONE_RING: Record<Tone, string> = {
  positive: "ring-emerald-300",
  attention: "ring-amber-300",
  critical: "ring-rose-300",
};

export const TONE_BG_SOFT: Record<Tone, string> = {
  positive: "bg-emerald-50",
  attention: "bg-amber-50",
  critical: "bg-rose-50",
};

export const TONE_TEXT: Record<Tone, string> = {
  positive: "text-emerald-700",
  attention: "text-amber-700",
  critical: "text-rose-700",
};

export const TONE_BORDER: Record<Tone, string> = {
  positive: "border-emerald-200",
  attention: "border-amber-200",
  critical: "border-rose-200",
};

export const TONE_DOT: Record<Tone, string> = {
  positive: "bg-emerald-500",
  attention: "bg-amber-500",
  critical: "bg-rose-500",
};

export const TONE_GRADIENT: Record<Tone, string> = {
  positive: "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500",
  attention: "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500",
  critical: "bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500",
};

export const TONE_GLOW: Record<Tone, string> = {
  positive: "shadow-[0_0_0_3px_rgba(16,185,129,0.18),0_8px_24px_-6px_rgba(16,185,129,0.45)]",
  attention: "shadow-[0_0_0_3px_rgba(245,158,11,0.18),0_8px_24px_-6px_rgba(245,158,11,0.45)]",
  critical: "shadow-[0_0_0_3px_rgba(244,63,94,0.18),0_8px_24px_-6px_rgba(244,63,94,0.45)]",
};

export function worstTone(signals: AISignal[]): Tone | null {
  if (!signals.length) return null;
  let acc: Tone = "positive";
  const rank: Record<Tone, number> = { positive: 0, attention: 1, critical: 2 };
  for (const s of signals) {
    const t = toneOf(s);
    if (rank[t] > rank[acc]) acc = t;
  }
  return acc;
}

export function isFresh(s: AISignal): boolean {
  const created = new Date(s.created_at).getTime();
  return Date.now() - created < 24 * 3600 * 1000;
}
