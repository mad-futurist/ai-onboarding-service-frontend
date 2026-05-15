"use client";

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

import { useMentorDashboard } from "@/hooks/use-mentor-dashboard";
import { useDemo } from "@/providers/demo-provider";

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

export default function MentorOverviewPage() {
  const { mentorId, mentorName } = useDemo();
  const { data, isLoading } = useMentorDashboard(mentorId);

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
            eyebrow="Mentor cockpit"
            title={
              <>
                Good day, <span className="ai-gradient-text">{firstName}</span>
              </>
            }
            description={
              activeCount
                ? `AI is monitoring ${activeCount} active onboarding${activeCount > 1 ? "s" : ""}. ${
                    attentionTotal
                      ? `${attentionTotal} need attention.`
                      : "Everything's on track."
                  }`
                : "Start by adding your first newcomer — AI will draft a personalized 30/60/90 plan in minutes."
            }
            actions={
              <>
                <Button asChild variant="outline">
                  <Link href="/mentor/knowledge">Open knowledge base</Link>
                </Button>
                <Button asChild>
                  <Link href="/mentor/newcomers/new">
                    <Plus className="h-4 w-4" /> Add newcomer
                  </Link>
                </Button>
              </>
            }
          />
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
              label="Active newcomers"
              value={<CountUp value={activeCount} />}
              icon={Users}
              hint={activeCount ? "Across all teams" : "No active newcomers yet"}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              label="Needs attention"
              value={<CountUp value={attentionTotal} />}
              icon={AlertCircle}
              tone={attentionTotal ? "warning" : "default"}
              pulse={attentionTotal > 0}
              hint={
                attentionTotal
                  ? `${needsAttention} flagged · ${blocked} blocked`
                  : "Nothing flagged"
              }
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              label="Avg progress"
              value={<CountUp value={avgProgress} suffix="%" />}
              icon={Activity}
              tone="ai"
              hint="Across active plans"
              trail={<ProgressRing value={avgProgress} size={36} stroke={4} tone="ai" />}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              label="Mentor time saved"
              value={
                timeSaved !== null ? (
                  <CountUp value={timeSaved} decimals={1} suffix="h" />
                ) : (
                  "4h 30m"
                )
              }
              icon={Clock}
              tone="success"
              hint="This week (est.)"
            />
          </motion.div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
              Newcomers
            </h2>
            <Button asChild size="sm" variant="ghost">
              <Link href="/mentor/newcomers/new">Add newcomer</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : newcomers.length ? (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-3 md:grid-cols-2"
            >
              {newcomers.map((n) => (
                <motion.div key={n.newcomer_id} variants={itemVariants}>
                  <NewcomerCard newcomer={n} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="No newcomers yet"
              description="Add your first newcomer to generate an AI-powered onboarding plan."
              action={
                <Button asChild>
                  <Link href="/mentor/newcomers/new">
                    <Plus className="h-4 w-4" /> Add newcomer
                  </Link>
                </Button>
              }
            />
          )}
        </section>

        <aside className="relative space-y-3 pl-4">
          <span
            aria-hidden
            className="absolute left-0 top-1 bottom-1 w-px rounded-full ai-gradient opacity-70"
          />
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              AI signals
              {recentSignals.length > 0 ? (
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-[color:var(--color-primary)] animate-[signal-pulse_2.4s_ease-in-out_infinite]" />
                  <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                </span>
              ) : null}
            </h2>
            <Button asChild size="sm" variant="ghost">
              <Link href="/mentor/signals">
                Open <ArrowUpRight className="h-3.5 w-3.5" />
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
                  <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" /> No signals yet
                </CardTitle>
                <CardDescription>
                  AI scans engagement, blocked tasks and Q&amp;A patterns. Signals will show here as they&apos;re detected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm" variant="soft" className="w-full">
                  <Link href="/mentor/signals">Open signals center</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
