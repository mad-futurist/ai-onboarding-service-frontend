"use client";

import { motion } from "framer-motion";
import { LineChart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/shared/CountUp";
import { useLocale } from "@/providers/locale-provider";

import { weekDelta } from "./derive";
import type { ID, MentorDashboardResponse } from "@/types";

interface WeekRollupProps {
  data: MentorDashboardResponse | undefined;
  mentorId: ID | null | undefined;
  isDemo?: boolean;
}

export function WeekRollup({ data, mentorId, isDemo = true }: WeekRollupProps) {
  const { t } = useLocale();
  const values = weekDelta(data, mentorId, isDemo);

  const allNonZero =
    (values.tasksShipped ?? 0) > 0 &&
    values.signalsResolved > 0 &&
    (values.draftsApproved ?? 0) > 0 &&
    values.hoursAbsorbed > 0;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]">
              <LineChart className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
              {t("mentor.dash.week.title")}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[color:var(--color-fg-muted)]">
            {t("mentor.dash.week.subhead")}
          </p>
        </div>
        {allNonZero ? (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-success-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-success-fg)]"
          >
            <motion.span
              aria-hidden
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="inline-block motion-reduce:animate-none"
            >
              🎉
            </motion.span>
            {t("mentor.dash.week.celebrate")}
          </motion.span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Cell
          value={values.tasksShipped}
          label={t("mentor.dash.week.tasks")}
        />
        <Cell value={values.signalsResolved} label={t("mentor.dash.week.signals")} />
        <Cell
          value={values.draftsApproved}
          label={t("mentor.dash.week.drafts")}
        />
        <Cell
          value={values.hoursAbsorbed}
          suffix="h"
          decimals={values.hoursAbsorbed % 1 === 0 ? 0 : 1}
          label={t("mentor.dash.week.hours")}
        />
      </div>
    </Card>
  );
}

function Cell({
  value,
  label,
  suffix,
  decimals = 0,
}: {
  value: number | null;
  label: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 p-3"
    >
      <div className="text-2xl font-semibold tracking-tight text-[color:var(--color-fg)]">
        {value === null ? (
          <span className="text-[color:var(--color-fg-faint)]">—</span>
        ) : (
          <>
            <CountUp value={value} decimals={decimals} />
            {suffix ?? ""}
          </>
        )}
      </div>
      <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">{label}</div>
    </motion.div>
  );
}
