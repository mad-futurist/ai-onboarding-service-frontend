"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Plus, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Confetti } from "@/components/shared/Confetti";
import { useLocale } from "@/providers/locale-provider";

import { pickAdjustMove, pickCheckInMove, pickCourseMove } from "./derive";
import type { AISignal, MentorDashboardNewcomerItem } from "@/types";

interface MentorMovesProps {
  newcomers: MentorDashboardNewcomerItem[];
  recentSignals: AISignal[];
}

interface MoveCardSpec {
  key: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  icon: typeof Calendar;
  celebrate: boolean;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
  },
};

export function MentorMoves({ newcomers, recentSignals }: MentorMovesProps) {
  const { t } = useLocale();
  const [confettiTick, setConfettiTick] = React.useState(0);

  const checkIn = React.useMemo(
    () => pickCheckInMove(newcomers),
    [newcomers],
  );
  const adjust = React.useMemo(() => pickAdjustMove(newcomers), [newcomers]);
  const course = React.useMemo(
    () => pickCourseMove(recentSignals, newcomers),
    [recentSignals, newcomers],
  );

  const specs: MoveCardSpec[] = [];

  if (checkIn) {
    const first = (checkIn.newcomer.full_name || "").split(" ")[0];
    specs.push({
      key: "checkIn",
      title: t("mentor.dash.moves.checkIn.title", { firstName: first }),
      body: t("mentor.dash.moves.checkIn.body", { n: checkIn.blockedCount }),
      cta: t("mentor.dash.moves.checkIn.cta"),
      href: `/mentor/meetings?newcomer=${checkIn.newcomer.newcomer_id}&duration=15`,
      icon: Calendar,
      celebrate: true,
    });
  }

  if (adjust) {
    const first = (adjust.newcomer.full_name || "").split(" ")[0];
    specs.push({
      key: "adjust",
      title: t("mentor.dash.moves.adjust.title", { firstName: first }),
      body: t("mentor.dash.moves.adjust.body", {
        signalTitle: adjust.signal.title,
      }),
      cta: t("mentor.dash.moves.adjust.cta"),
      href: `/mentor/newcomers/${adjust.newcomer.newcomer_id}/plan`,
      icon: Wand2,
      celebrate: false,
    });
  }

  if (course) {
    const slug = encodeURIComponent(course.signalType);
    specs.push({
      key: "course",
      title: t("mentor.dash.moves.course.title", { topic: course.topic }),
      body: t("mentor.dash.moves.course.body", {
        count: course.occurrenceCount,
      }),
      cta: t("mentor.dash.moves.course.cta"),
      href: `/mentor/courses/new?topic=${slug}`,
      icon: Sparkles,
      celebrate: true,
    });
  }

  if (specs.length === 0) {
    return (
      <Card className="relative overflow-hidden p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg ai-gradient-soft text-[color:var(--color-primary-active)]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            {t("mentor.dash.moves.title")}
          </h2>
        </div>
        <p className="mt-3 max-w-xl text-sm text-[color:var(--color-fg-muted)]">
          {t("mentor.dash.moves.empty.body")}
        </p>
        <Button asChild className="mt-4" variant="ai">
          <Link href="/mentor/newcomers/new">
            <Plus className="h-4 w-4" /> {t("mentor.dash.moves.empty.cta")}
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            {t("mentor.dash.moves.title")}
          </h2>
          <p className="mt-0.5 text-xs text-[color:var(--color-fg-muted)]">
            {t("mentor.dash.moves.subhead")}
          </p>
        </div>
      </div>
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
      >
        {specs.map((spec) => (
          <motion.div key={spec.key} variants={itemVariants}>
            <MoveCard
              spec={spec}
              onCelebrate={() => setConfettiTick((c) => c + 1)}
            />
          </motion.div>
        ))}
      </motion.div>
      <div className="pointer-events-none relative">
        <Confetti trigger={confettiTick} count={32} />
      </div>
    </section>
  );
}

function MoveCard({
  spec,
  onCelebrate,
}: {
  spec: MoveCardSpec;
  onCelebrate: () => void;
}) {
  const Icon = spec.icon;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative h-full"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] ai-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <Card className="flex h-full flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            {spec.title}
          </h3>
        </div>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-[color:var(--color-fg-muted)]">
          {spec.body}
        </p>
        <div className="mt-4">
          <Button
            asChild
            variant="ai"
            size="sm"
            onClick={spec.celebrate ? onCelebrate : undefined}
          >
            <Link href={spec.href}>
              {spec.cta} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
