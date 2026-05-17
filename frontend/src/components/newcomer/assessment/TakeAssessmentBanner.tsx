"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getActiveAssessmentForNewcomer,
  getAssessmentSubmission,
} from "@/services/assessments";
import { useLocale } from "@/providers/locale-provider";
import type { ID } from "@/types";

import { AnimatedArrowPointer } from "./AnimatedArrowPointer";

interface Props {
  newcomerId: ID | null | undefined;
}

export function TakeAssessmentBanner({ newcomerId }: Props) {
  const reduceMotion = useReducedMotion();
  const { t } = useLocale();

  const { data: assessment } = useQuery({
    queryKey: ["newcomer-assessment", newcomerId],
    queryFn: () => getActiveAssessmentForNewcomer(newcomerId as ID),
    enabled: !!newcomerId,
  });

  const { data: submission } = useQuery({
    queryKey: ["newcomer-assessment-submission", assessment?.id],
    queryFn: () => getAssessmentSubmission(assessment!.id),
    enabled: !!assessment,
  });

  if (!assessment) return null;
  if (assessment.status === "draft") return null;

  // Already submitted? Show a small "done" pill instead.
  if (submission?.submitted_at) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span className="font-medium">{t("assessment.cta.submitted")}</span>
        <span className="text-emerald-800/80">{t("assessment.cta.submittedHint")}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border border-[color:var(--color-primary-soft)] ai-gradient p-6 text-white shadow-lg"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(255,255,255,0.6), transparent 50%), radial-gradient(ellipse at bottom right, rgba(255,255,255,0.3), transparent 60%)",
        }}
      />
      <div className="relative grid items-center gap-5 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="h-3 w-3" /> {t("assessment.cta.eyebrow")}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t("assessment.cta.title")}
          </h2>
          <p className="text-sm text-white/85">
            {t("assessment.cta.description", {
              minutes: Math.max(3, assessment.questions.length * 2),
            })}
          </p>
        </div>
        <div className="relative flex items-center gap-3">
          <AnimatedArrowPointer
            className="text-white/90 -mr-1"
            direction="down-right"
          />
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            <Button
              asChild
              size="lg"
              variant="default"
              className="bg-white text-[color:var(--color-primary-active)] hover:bg-white/90 shadow-xl shadow-black/10 px-6"
            >
              <Link href="/newcomer/assessment" data-demo-id="newcomer-assessment-start">
                {t("assessment.cta.start")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
