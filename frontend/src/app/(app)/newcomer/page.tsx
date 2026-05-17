"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, Users, MessageSquare, Calendar } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { BlockedTrigger } from "@/components/newcomer/BlockedDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { TakeAssessmentBanner } from "@/components/newcomer/assessment/TakeAssessmentBanner";

import { useDemo } from "@/providers/demo-provider";
import { useNewcomerDashboard } from "@/hooks/use-newcomer-dashboard";
import { getInitials } from "@/lib/utils";

const FALLBACK_SUGGESTIONS = [
  "Where is the deployment guide?",
  "Who reviews my PR?",
  "How does pointage work?",
  "What if I'm blocked?",
];

const FALLBACK_PEOPLE = [
  { name: "Marko Ivanov", role: "Tech Lead" },
  { name: "Victor Lutsenko", role: "DevOps" },
  { name: "Ana Korovai", role: "QA Engineer" },
];

export default function NewcomerHomePage() {
  const { newcomerId, newcomerName } = useDemo();
  const { data, isLoading } = useNewcomerDashboard(newcomerId);

  const firstName = newcomerName.split(" ")[0];
  const progress = data?.progress;
  const day = progress?.current_day ?? 1;
  const week = progress?.current_week ?? 1;
  const total = 90;
  const todayTasks = data?.today_tasks ?? [];
  const focus = data?.current_focus ?? (week === 1 ? "Team & codebase basics" : week === 2 ? "First backend ticket" : "Own a feature");
  const weekGoal = data?.week_goal ?? "Be ready to pick your first ticket";
  const suggested = data?.suggested_questions?.length ? data.suggested_questions : FALLBACK_SUGGESTIONS;
  const recommendedDocs = data?.recommended_documents ?? [];
  const people = data?.people_to_know?.length ? data.people_to_know : FALLBACK_PEOPLE;
  const phaseLabel = week <= 4 ? "Phase 1" : week <= 8 ? "Phase 2" : "Phase 3";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow={`Day ${day} · Week ${week}`}
        title={
          <>
            Welcome, <span className="ai-gradient-text">{firstName}</span>
          </>
        }
        description={`Current focus: ${focus}. Only what matters today — your full plan is one click away.`}
        actions={
          <>
            <BlockedTrigger />
            <Button asChild variant="ai">
              <Link href="/newcomer/ask" data-demo-id="newcomer-ask-ai">
                <Sparkles className="h-4 w-4" /> Ask AI
              </Link>
            </Button>
          </>
        }
      />

      <TakeAssessmentBanner newcomerId={newcomerId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>This week&apos;s goal</CardTitle>
              <CardDescription>{weekGoal}</CardDescription>
            </div>
            <Badge tone="ai" size="lg">
              <Sparkles className="h-3 w-3" /> {phaseLabel}
            </Badge>
          </CardHeader>
          <CardContent>
            <ProgressBar
              value={progress?.progress_percent ?? Math.round((day / total) * 100)}
              label={`Day ${day} of ${total}`}
              hint={progress ? `${progress.completed_tasks} of ${progress.total_tasks} tasks done` : undefined}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[color:var(--color-primary)]" /> Up next
            </CardTitle>
            <CardDescription>From your plan.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[color:var(--color-fg-muted)] space-y-1">
            {data?.next_tasks?.length
              ? data.next_tasks.slice(0, 3).map((t) => (
                  <Link
                    key={t.id}
                    href={`/newcomer/tasks/${t.id}`}
                    className="block truncate hover:text-[color:var(--color-fg)]"
                  >
                    · {t.title}
                  </Link>
                ))
              : (
                <>
                  <div>· Read Payments overview</div>
                  <div>· Meet Ana at 14:00</div>
                </>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <Card data-demo-id="newcomer-today-list">
            <CardHeader>
              <CardTitle>Today</CardTitle>
              <CardDescription>What you should focus on right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </>
              ) : todayTasks.length ? (
                todayTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/newcomer/tasks/${t.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3 hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                          t.status === "done"
                            ? "bg-[color:var(--color-success)] border-[color:var(--color-success)]"
                            : t.status === "blocked"
                              ? "border-[color:var(--color-danger)]"
                              : "border-[color:var(--color-primary)]"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[color:var(--color-fg)] truncate">{t.title}</div>
                        {t.description ? (
                          <div className="text-xs text-[color:var(--color-fg-muted)] line-clamp-1">{t.description}</div>
                        ) : null}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[color:var(--color-fg-faint)]" />
                  </Link>
                ))
              ) : (
                <EmptyState
                  title="Nothing scheduled for today"
                  description="Your plan will populate this list once your mentor approves it."
                  action={
                    <Button asChild variant="soft">
                      <Link href="/newcomer/plan">Open my plan</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Recommended docs
              </CardTitle>
              <CardDescription>Picked by AI based on this week&apos;s focus.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {recommendedDocs.length ? (
                recommendedDocs.slice(0, 6).map((d) => (
                  <article
                    key={d.id}
                    className="rounded-lg border border-[color:var(--color-border)] bg-white p-3 hover:border-[color:var(--color-primary-ring)]"
                  >
                    <div className="text-sm font-medium text-[color:var(--color-fg)] truncate">{d.title}</div>
                    <div className="mt-0.5 text-[11px] text-[color:var(--color-fg-subtle)]">{d.domain}</div>
                  </article>
                ))
              ) : (
                <>
                  {["Payments architecture overview", "Code review checklist", "Deployment guide", "Pointage process"].map(
                    (t) => (
                      <article
                        key={t}
                        className="rounded-lg border border-[color:var(--color-border)] bg-white p-3 hover:border-[color:var(--color-primary-ring)]"
                      >
                        <div className="text-sm font-medium text-[color:var(--color-fg)] truncate">{t}</div>
                        <div className="mt-0.5 text-[11px] text-[color:var(--color-fg-subtle)]">Engineering · Doc</div>
                      </article>
                    ),
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <AIInsightCard
            title="Ask AI anything"
            description="Grounded answers from your team's docs + people to ask."
            tone="filled"
            actions={
              <Button asChild size="sm" variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25">
                <Link href="/newcomer/ask">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            }
          >
            <div className="space-y-1.5">
              {suggested.slice(0, 4).map((q) => (
                <Link
                  key={q}
                  href={`/newcomer/ask?q=${encodeURIComponent(q)}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm text-white hover:bg-white/25 transition-colors backdrop-blur"
                >
                  <span className="truncate">{q}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                </Link>
              ))}
            </div>
          </AIInsightCard>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[color:var(--color-primary)]" /> People to know
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {people.slice(0, 4).map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[color:var(--color-fg)] truncate">{p.name}</div>
                    <div className="text-xs text-[color:var(--color-fg-muted)] truncate">{p.role}</div>
                  </div>
                  <Button size="icon-sm" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
