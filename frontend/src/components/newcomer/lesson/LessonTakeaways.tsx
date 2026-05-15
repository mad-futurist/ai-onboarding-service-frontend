"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface LessonTakeawaysProps {
  takeaways: string[];
  /** When true, the section header reads "AI-derived takeaways" instead of the default. */
  aiDerived?: boolean;
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

export function LessonTakeaways({ takeaways, aiDerived = false }: LessonTakeawaysProps) {
  if (!takeaways.length) return null;
  return (
    <section className="ai-border relative overflow-hidden rounded-2xl bg-white p-5">
      <div className="absolute inset-0 ai-gradient-soft opacity-30" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
          <Sparkles className="h-3 w-3" />
          {aiDerived ? "AI-derived takeaways" : "Key takeaways"}
        </div>
        <motion.ul
          className="mt-3 space-y-2"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {takeaways.map((t, i) => (
            <motion.li
              key={i}
              variants={itemVariants}
              className="flex items-start gap-2 text-sm text-[color:var(--color-fg)]"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-primary)]" />
              <span>{t}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

/**
 * Fallback takeaway extraction: pull the first 1-3 markdown headings + their
 * first sentence. Best-effort, kept conservative so we never render noise.
 */
export function deriveFallbackTakeaways(body: string | null | undefined): string[] {
  if (!body) return [];
  const lines = body.split("\n");
  const out: string[] = [];

  for (let i = 0; i < lines.length && out.length < 4; i++) {
    const headingMatch = lines[i].match(/^#{1,4}\s+(.+?)\s*$/);
    if (!headingMatch) continue;
    const heading = headingMatch[1].trim();
    let firstSentence = "";
    for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
      const candidate = lines[j].trim();
      if (!candidate || candidate.startsWith("#")) continue;
      const sentence = candidate.split(/[.!?](\s|$)/)[0]?.trim();
      if (sentence && sentence.length > 8) {
        firstSentence = sentence;
        break;
      }
    }
    out.push(firstSentence ? `${heading} — ${firstSentence}` : heading);
  }
  return out;
}
