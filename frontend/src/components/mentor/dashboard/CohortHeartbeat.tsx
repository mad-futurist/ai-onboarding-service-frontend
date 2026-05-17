"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocale } from "@/providers/locale-provider";

import { cohortColumns, COHORT_CELL_COUNT } from "./derive";
import type { CohortColumn } from "./derive";
import type { MentorDashboardNewcomerItem } from "@/types";

interface CohortHeartbeatProps {
  newcomers: MentorDashboardNewcomerItem[];
  isLoading: boolean;
}

const MAX_VISIBLE = 12;

export function CohortHeartbeat({ newcomers, isLoading }: CohortHeartbeatProps) {
  const { t } = useLocale();

  if (isLoading) {
    return <CardSkeleton rows={6} />;
  }

  if (newcomers.length === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]">
            <Activity className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            {t("mentor.dash.cohort.title")}
          </h2>
        </div>
        <p className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
          {t("mentor.dash.cohort.empty")}
        </p>
      </Card>
    );
  }

  const columns = cohortColumns(newcomers);
  const visible = columns.slice(0, MAX_VISIBLE);
  const overflow = columns.length - visible.length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg ai-gradient-soft text-[color:var(--color-primary-active)]">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
              {t("mentor.dash.cohort.title")}
            </h2>
          </div>
          <p className="mt-1 max-w-xl text-xs text-[color:var(--color-fg-muted)]">
            {t("mentor.dash.cohort.subhead")}
          </p>
        </div>
      </div>

      <TooltipProvider delayDuration={120}>
        <div className="mt-5 flex items-end gap-3 overflow-x-auto pb-2">
          {visible.map((col, idx) => (
            <ColumnView key={col.newcomerId} col={col} indexInRow={idx} t={t} />
          ))}
          {overflow > 0 ? (
            <div className="flex h-full min-h-[140px] shrink-0 flex-col items-center justify-end pb-2 text-xs text-[color:var(--color-fg-muted)]">
              +{overflow} more
            </div>
          ) : null}
        </div>
      </TooltipProvider>
    </Card>
  );
}

function ColumnView({
  col,
  indexInRow,
  t,
}: {
  col: CohortColumn;
  indexInRow: number;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const cells = Array.from({ length: COHORT_CELL_COUNT }, (_, i) => i);
  const capColor =
    col.severity === "high"
      ? "var(--color-danger-fg)"
      : col.severity === "medium"
        ? "var(--color-warning-fg)"
        : col.severity === "low"
          ? "var(--color-success-fg)"
          : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="flex shrink-0 flex-col items-center gap-2"
          style={{ minWidth: 48 }}
        >
          <Link
            href={`/mentor/newcomers/${col.newcomerId}`}
            aria-label={col.firstName}
            className="group flex flex-col items-center gap-2"
          >
            <div className="flex flex-col-reverse items-center gap-[2px]">
              {cells.map((i) => {
                const filled = i < col.filledCells;
                const isCap = filled && i === col.filledCells - 1;
                const bg = filled
                  ? col.hasSignal
                    ? "linear-gradient(180deg, var(--color-ai-from), var(--color-ai-via))"
                    : "var(--color-primary)"
                  : "var(--color-surface-muted)";
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scaleY: 0.1 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.22,
                      ease: "easeOut",
                      delay: indexInRow * 0.03 + i * 0.012,
                    }}
                    aria-hidden
                    style={{
                      background: bg,
                      borderTop:
                        isCap && capColor
                          ? `2px solid ${capColor}`
                          : "none",
                      transformOrigin: "bottom",
                    }}
                    className="h-2 w-6 rounded-[2px] motion-reduce:transform-none motion-reduce:opacity-100"
                  />
                );
              })}
            </div>
            <div className="flex flex-col items-center">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--color-surface-muted)] text-[10px] font-semibold tracking-tight text-[color:var(--color-fg)] group-hover:bg-[color:var(--color-primary-soft)] group-hover:text-[color:var(--color-primary-active)] transition-colors">
                {col.initials}
              </span>
              <span className="mt-1 max-w-[60px] truncate text-[10px] text-[color:var(--color-fg-muted)]">
                {col.firstName}
              </span>
            </div>
          </Link>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-left">
        <div className="font-semibold">
          {t("mentor.dash.cohort.tooltip", {
            firstName: col.firstName,
            percent: col.percent,
          })}
        </div>
        {col.signalTitle ? (
          <div className="mt-0.5 opacity-80">
            {t("mentor.dash.cohort.tooltipSignal", {
              signalTitle: col.signalTitle,
            })}
          </div>
        ) : null}
        <div className="mt-1 inline-flex items-center gap-1 text-[color:var(--color-primary)]">
          {t("mentor.dash.cohort.view")} <ArrowUpRight className="h-3 w-3" />
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
