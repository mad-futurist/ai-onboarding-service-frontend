"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  AlertCircle,
  Activity,
  Clock,
  Plus,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewcomerCard } from "@/components/mentor/NewcomerCard";
import { SignalRow } from "@/components/ai/SignalRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { MetricsRowSkeleton, CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { CountUp } from "@/components/shared/CountUp";
import { AIPulseStrip } from "@/components/mentor/dashboard/AIPulseStrip";
import { TodaysFocus } from "@/components/mentor/dashboard/TodaysFocus";
import { CohortHeartbeat } from "@/components/mentor/dashboard/CohortHeartbeat";
import { MentorMoves } from "@/components/mentor/dashboard/MentorMoves";
import { WeekRollup } from "@/components/mentor/dashboard/WeekRollup";
import { relativeShortTime, teamCount } from "@/components/mentor/dashboard/derive";

import { useMentorDashboard } from "@/hooks/use-mentor-dashboard";
import { useDemo } from "@/providers/demo-provider";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
  },
};

type NewcomerFilter = "all" | "eyes" | "ok";

export default function MentorOverviewPage() {
  const { mentorId, mentorName } = useDemo();
  const { t } = useLocale();
  const { data, isLoading } = useMentorDashboard(mentorId);
  const [filter, setFilter] = React.useState<NewcomerFilter>("all");

  const activeCount = data?.active_newcomers ?? 0;
  const needsAttention = data?.needs_attention_count ?? 0;
  const blocked = data?.blocked_count ?? 0;
  const newcomers = data?.newcomers ?? [];
  const avgProgress = newcomers.length
    ? Math.round(newcomers.reduce((s, n) => s + (n.progress_percent ?? 0), 0) / newcomers.length)
    : 0;
  const timeSaved = data?.time_saved_hours ?? null;

  const recentSignals = (data?.recent_signals ?? [])
    .concat(
      newcomers
        .map((n) => n.latest_signal)
        .filter((s): s is NonNullable<typeof s> => !!s),
    )
    .slice(0, 3);

  const firstName = mentorName.split(" ")[0];
  const attentionTotal = needsAttention + blocked;
  const teams = teamCount(newcomers);

  const lastScanIso = (data?.recent_signals ?? [])
    .map((s) => s.created_at)
    .sort()
    .reverse()[0];

  const flaggedCount = newcomers.filter(
    (n) =>
      n.computed_status === "needs_attention" ||
      n.computed_status === "blocked" ||
      (n.blocked_tasks ?? 0) > 0,
  ).length;
  const okCount = Math.max(0, newcomers.length - flaggedCount);

  const filteredNewcomers = newcomers.filter((n) => {
    if (filter === "all") return true;
    const isFlagged =
      n.computed_status === "needs_attention" ||
      n.computed_status === "blocked" ||
      (n.blocked_tasks ?? 0) > 0;
    return filter === "eyes" ? isFlagged : !isFlagged;
  });

  const heroDescription = (() => {
    if (!activeCount) return t("mentor.dash.hero.descEmpty");
    if (attentionTotal) {
      return t(
        activeCount === 1
          ? "mentor.dash.hero.descActiveOne"
          : "mentor.dash.hero.descActive",
        { count: activeCount, attention: attentionTotal },
      );
    }
    return t(
      activeCount === 1
        ? "mentor.dash.hero.descCalmOne"
        : "mentor.dash.hero.descCalm",
      { count: activeCount },
    );
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      <section className="relative overflow-hidden rounded-[20px] border border-[color:var(--color-border)] bg-white px-6 py-7 sm:px-8 sm:py-9">
        <AuroraBackground intensity="hero" />
        <div className="relative">
          <div className="pointer-events-none absolute right-4 top-0 hidden sm:block">
            <span className="animate-float-y inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary-ring)] bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)] shadow-[var(--shadow-card)] backdrop-blur">
              <Sparkles className="h-3 w-3" /> AI cockpit
            </span>
          </div>
          <PageHeader
            eyebrow={t("mentor.dash.hero.eyebrow")}
            title={
              <>
                Good day, <span className="ai-gradient-text">{firstName}</span>
              </>
            }
            description={heroDescription}
            actions={
              <>
                <Button asChild variant="outline">
                  <Link href="/mentor/knowledge" data-demo-id="mentor-hero-knowledge">
                    {t("mentor.dash.hero.actionKnowledge")}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/mentor/newcomers/new" data-demo-id="mentor-hero-add-newcomer">
                    <Plus className="h-4 w-4" /> {t("mentor.dash.hero.actionAdd")}
                  </Link>
                </Button>
              </>
            }
          />
          <div data-demo-id="mentor-ai-pulse">
            <AIPulseStrip data={data} />
          </div>
        </div>
      </section>

      {isLoading ? (
        <MetricsRowSkeleton />
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants}>
            <MetricCard
              label={t("mentor.dash.kpi.active.label")}
              value={<CountUp value={activeCount} />}
              icon={Users}
              hint={
                activeCount
                  ? teams <= 1
                    ? t("mentor.dash.kpi.active.hintOneTeam")
                    : t("mentor.dash.kpi.active.hintLoaded", { teamCount: teams })
                  : t("mentor.dash.kpi.active.hintEmpty")
              }
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              label={t("mentor.dash.kpi.attention.label")}
              value={<CountUp value={attentionTotal} />}
              icon={AlertCircle}
              tone={attentionTotal ? "warning" : "default"}
              pulse={attentionTotal > 0}
              hint={
                attentionTotal
                  ? t("mentor.dash.kpi.attention.hintLoaded", {
                      flagged: needsAttention,
                      blocked,
                    })
                  : t("mentor.dash.kpi.attention.hintEmpty")
              }
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              label={t("mentor.dash.kpi.progress.label")}
              value={<CountUp value={avgProgress} suffix="%" />}
              icon={Activity}
              tone="ai"
              hint={
                activeCount
                  ? t("mentor.dash.kpi.progress.hintLoaded", { active: activeCount })
                  : t("mentor.dash.kpi.progress.hintEmpty")
              }
              trail={<ProgressRing value={avgProgress} size={36} stroke={4} tone="ai" />}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              label={t("mentor.dash.kpi.timeSaved.label")}
              value={
                timeSaved !== null ? (
                  <CountUp value={timeSaved} decimals={1} suffix="h" />
                ) : (
                  "4h 30m"
                )
              }
              icon={Clock}
              tone="success"
              hint={
                activeCount
                  ? t("mentor.dash.kpi.timeSaved.hintLoaded")
                  : t("mentor.dash.kpi.timeSaved.hintEmpty")
              }
            />
          </motion.div>
        </motion.div>
      )}

      <TodaysFocus
        newcomers={newcomers}
        recentSignals={data?.recent_signals ?? []}
        isLoading={isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
                {t("mentor.dash.ncs.heading")}
              </h2>
              {newcomers.length > 0 ? (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] px-1.5 text-[11px] font-semibold tabular-nums text-[color:var(--color-fg-muted)]">
                  {newcomers.length}
                </span>
              ) : null}
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/mentor/newcomers/new">{t("mentor.dash.ncs.add")}</Link>
            </Button>
          </div>

          {newcomers.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={t("mentor.dash.ncs.filterAll", { n: newcomers.length })}
              />
              <FilterChip
                active={filter === "eyes"}
                onClick={() => setFilter("eyes")}
                tone="warning"
                label={t("mentor.dash.ncs.filterEyes", { n: flaggedCount })}
              />
              <FilterChip
                active={filter === "ok"}
                onClick={() => setFilter("ok")}
                tone="success"
                label={t("mentor.dash.ncs.filterOk", { n: okCount })}
              />
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : newcomers.length === 0 ? (
            <EmptyState
              title={t("mentor.dash.ncs.emptyTitle")}
              description={t("mentor.dash.ncs.emptyDesc")}
              action={
                <Button asChild>
                  <Link href="/mentor/newcomers/new">
                    <Plus className="h-4 w-4" /> {t("mentor.dash.ncs.add")}
                  </Link>
                </Button>
              }
            />
          ) : filteredNewcomers.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 p-6 text-center text-sm text-[color:var(--color-fg-muted)]">
              {filter === "eyes"
                ? t("mentor.dash.ncs.filterEmptyEyes")
                : t("mentor.dash.ncs.filterEmptyOk")}
            </div>
          ) : (
            <motion.div
              key={filter}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-3 md:grid-cols-2"
            >
              {filteredNewcomers.map((n) => (
                <motion.div key={n.newcomer_id} variants={itemVariants}>
                  <NewcomerCard newcomer={n} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        <aside className="relative space-y-3 pl-4">
          <span
            aria-hidden
            className="absolute left-0 top-1 bottom-1 w-px rounded-full ai-gradient opacity-70"
          />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                {t("mentor.dash.sig.heading")}
                {recentSignals.length > 0 ? (
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-[color:var(--color-primary)] animate-[signal-pulse_2.4s_ease-in-out_infinite]" />
                    <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                  </span>
                ) : null}
              </h2>
              {recentSignals.length > 0 && lastScanIso ? (
                <p className="mt-0.5 text-[11px] text-[color:var(--color-fg-muted)]">
                  {t("mentor.dash.sig.lastScan", {
                    relativeTime: relativeShortTime(lastScanIso),
                  })}
                </p>
              ) : null}
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/mentor/signals">
                {t("mentor.dash.sig.openShort")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <CardSkeleton rows={4} />
          ) : recentSignals.length ? (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {recentSignals.map((s, idx) => (
                <motion.div key={`${s.id}-${idx}`} variants={itemVariants}>
                  <SignalRow signal={s} compact />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" />{" "}
                  {t("mentor.dash.sig.emptyTitle")}
                </CardTitle>
                <CardDescription>
                  {t("mentor.dash.sig.emptyDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm" variant="soft" className="w-full">
                  <Link href="/mentor/signals">
                    {t("mentor.dash.sig.openCenter")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      <CohortHeartbeat newcomers={newcomers} isLoading={isLoading} />

      <MentorMoves
        newcomers={newcomers}
        recentSignals={data?.recent_signals ?? []}
      />

      <WeekRollup data={data} mentorId={mentorId} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: "default" | "warning" | "success";
}) {
  const toneActive: Record<typeof tone, string> = {
    default:
      "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]",
    warning:
      "border-[color:var(--color-warning-fg)] bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)]",
    success:
      "border-[color:var(--color-success-fg)] bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-ring)] focus-visible:ring-offset-2",
        active
          ? toneActive[tone]
          : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-primary-ring)] hover:text-[color:var(--color-fg)]",
      )}
    >
      {label}
    </button>
  );
}
