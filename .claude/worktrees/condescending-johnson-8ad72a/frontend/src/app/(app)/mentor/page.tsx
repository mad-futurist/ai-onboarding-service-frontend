"use client";

import Link from "next/link";
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

import { useMentorDashboard } from "@/hooks/use-mentor-dashboard";
import { useDemo } from "@/providers/demo-provider";

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

  // Aggregate latest signals from newcomers (since the response groups them differently)
  const recentSignals = (data?.recent_signals ?? [])
    .concat(
      newcomers
        .map((n) => n.latest_signal)
        .filter((s): s is NonNullable<typeof s> => !!s),
    )
    .slice(0, 3);

  const firstName = mentorName.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
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
                needsAttention || blocked
                  ? `${needsAttention + blocked} need attention.`
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

      {isLoading ? (
        <MetricsRowSkeleton />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active newcomers"
            value={activeCount}
            icon={Users}
            hint={activeCount ? "Across all teams" : "No active newcomers yet"}
          />
          <MetricCard
            label="Needs attention"
            value={needsAttention + blocked}
            icon={AlertCircle}
            tone={needsAttention + blocked ? "warning" : "default"}
            hint={
              needsAttention + blocked
                ? `${needsAttention} flagged · ${blocked} blocked`
                : "Nothing flagged"
            }
          />
          <MetricCard
            label="Avg progress"
            value={`${avgProgress}%`}
            icon={Activity}
            tone="ai"
            hint="Across active plans"
          />
          <MetricCard
            label="Mentor time saved"
            value={timeSaved !== null ? `${timeSaved}h` : "4h 30m"}
            icon={Clock}
            tone="success"
            hint="This week (est.)"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">Newcomers</h2>
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
            <div className="grid gap-3 md:grid-cols-2">
              {newcomers.map((n) => (
                <NewcomerCard key={n.newcomer_id} newcomer={n} />
              ))}
            </div>
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

        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">AI signals</h2>
            <Button asChild size="sm" variant="ghost">
              <Link href="/mentor/signals">
                Open <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <CardSkeleton rows={4} />
          ) : recentSignals.length ? (
            <div className="space-y-3">
              {recentSignals.map((s, idx) => (
                <SignalRow key={`${s.id}-${idx}`} signal={s} compact />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" /> No signals yet
                </CardTitle>
                <CardDescription>
                  AI scans engagement, blocked tasks and Q&amp;A patterns. Signals will show here as they're detected.
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
