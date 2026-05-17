"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Hourglass,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { useLocale } from "@/providers/locale-provider";

import { aiHandledRows, topNeedsAttention } from "./derive";
import type { HandledRow, NeedsRow } from "./derive";
import type { AISignal, MentorDashboardNewcomerItem } from "@/types";

interface TodaysFocusProps {
  newcomers: MentorDashboardNewcomerItem[];
  recentSignals: AISignal[];
  isLoading: boolean;
  isDemo?: boolean;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 240, damping: 24 },
  },
};

export function TodaysFocus({
  newcomers,
  recentSignals,
  isLoading,
  isDemo = true,
}: TodaysFocusProps) {
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <CardSkeleton rows={3} />
        <CardSkeleton rows={3} />
      </div>
    );
  }

  const needs = topNeedsAttention(newcomers);
  const handled = aiHandledRows(recentSignals, newcomers, isDemo);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="relative overflow-hidden p-5">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] ai-gradient" />
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            {t("mentor.dash.today.needsTitle")}
          </h2>
        </div>
        {needs.length === 0 ? (
          <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40 p-3 text-sm text-[color:var(--color-fg-muted)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-success-fg)]" />
            <p>{t("mentor.dash.today.needsEmpty")}</p>
          </div>
        ) : (
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="mt-3 space-y-2"
          >
            {needs.map((row) => (
              <motion.li key={row.newcomer.newcomer_id} variants={itemVariants}>
                <NeedsRowItem row={row} t={t} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </Card>

      <Card className="relative overflow-hidden p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]">
            <Wand2 className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            {t("mentor.dash.today.handledTitle")}
          </h2>
        </div>
        {handled.length === 0 ? (
          <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40 p-3 text-sm text-[color:var(--color-fg-muted)]">
            <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-fg-faint)]" />
            <p>{t("mentor.dash.today.handledEmpty")}</p>
          </div>
        ) : (
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="mt-3 space-y-2"
          >
            {handled.map((row) => (
              <motion.li key={row.id} variants={itemVariants}>
                <HandledRowItem row={row} t={t} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </Card>
    </div>
  );
}

function NeedsRowItem({
  row,
  t,
}: {
  row: NeedsRow;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const firstName = (row.newcomer.full_name || "Newcomer").split(" ")[0];
  let body: string;
  let Icon = Sparkles;
  if (row.reason === "blocked") {
    Icon = AlertOctagon;
    body = t("mentor.dash.today.rowBlocked", { count: row.count ?? 0 });
  } else if (row.reason === "slow") {
    Icon = Hourglass;
    body = t("mentor.dash.today.rowSlow", { days: row.days ?? 0 });
  } else {
    Icon = Sparkles;
    body = t("mentor.dash.today.rowSignal", {
      signalTitle: row.signalTitle ?? "—",
    });
  }

  const accent =
    row.reason === "blocked"
      ? "text-[color:var(--color-danger-fg)]"
      : row.reason === "slow"
        ? "text-[color:var(--color-warning-fg)]"
        : "text-[color:var(--color-primary-active)]";

  return (
    <Link
      href={`/mentor/newcomers/${row.newcomer.newcomer_id}`}
      className="group flex items-center gap-3 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 transition-colors hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/30"
    >
      <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            {firstName}
          </span>
          <span className="truncate text-xs text-[color:var(--color-fg-muted)]">
            {row.newcomer.job_title}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--color-fg-muted)]">
          {body}
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-[color:var(--color-fg-faint)] transition-colors group-hover:text-[color:var(--color-primary)]" />
    </Link>
  );
}

function HandledRowItem({
  row,
  t,
}: {
  row: HandledRow;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const labelKey =
    row.kind === "drafted"
      ? "mentor.dash.today.handledDrafted"
      : row.kind === "summarized"
        ? "mentor.dash.today.handledSummarized"
        : "mentor.dash.today.handledResolved";
  const Icon =
    row.kind === "drafted"
      ? FileText
      : row.kind === "summarized"
        ? Sparkles
        : CheckCircle2;
  const body = t(labelKey, { firstName: row.firstName });

  const href = row.newcomerId ? `/mentor/newcomers/${row.newcomerId}` : "/mentor/signals";

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 transition-colors hover:border-[color:var(--color-primary-ring)]"
    >
      <Icon className="h-4 w-4 shrink-0 text-[color:var(--color-success-fg)]" />
      <p className="line-clamp-1 flex-1 text-sm text-[color:var(--color-fg)]">{body}</p>
      <span className="shrink-0 text-xs tabular-nums text-[color:var(--color-fg-faint)]">
        {row.time}
      </span>
    </Link>
  );
}
