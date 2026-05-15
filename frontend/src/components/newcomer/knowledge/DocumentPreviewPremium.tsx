"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { BookOpen, Hash } from "lucide-react";

import { Markdown } from "@/components/shared/Markdown";
import { Badge } from "@/components/ui/badge";
import type { NewcomerDocument } from "@/types";

interface DocumentPreviewPremiumProps {
  doc: NewcomerDocument;
}

export function DocumentPreviewPremium({ doc }: DocumentPreviewPremiumProps) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.3 });

  const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easing }}
      className="relative ai-border rounded-2xl"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-elevated)]">
        {/* Reading progress bar */}
        <motion.div
          aria-hidden
          className="absolute left-0 top-0 z-10 h-[3px] ai-gradient origin-left"
          style={{ scaleX: progress, width: "100%" }}
        />

        {/* Header */}
        <div className="relative px-6 pt-7 pb-5 border-b border-[color:var(--color-border)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ai-gradient-soft blur-2xl opacity-70" aria-hidden />
          <div className="relative flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl ai-gradient text-white shadow-[var(--shadow-ai)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight">
                <span className="ai-gradient-text">{doc.title}</span>
              </h1>
              <div className="flex flex-wrap gap-1.5">
                {doc.domain ? (
                  <Badge tone="brand" className="capitalize">
                    {doc.domain}
                  </Badge>
                ) : null}
                {doc.scope ? (
                  <Badge tone="ai" className="capitalize">
                    {doc.scope}
                  </Badge>
                ) : null}
                {doc.role_target ? (
                  <Badge tone="neutral" className="capitalize">
                    {doc.role_target.replaceAll("_", " ")}
                  </Badge>
                ) : null}
                <Badge tone="neutral">
                  <Hash className="h-3 w-3" /> {doc.chunks_count} chunks
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          <Markdown>{doc.content}</Markdown>
        </div>
      </div>
    </motion.div>
  );
}
