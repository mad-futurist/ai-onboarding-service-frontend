"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Compass,
  Edit3,
  ListChecks,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { JourneyTimeline } from "@/components/mentor/plan-generator/JourneyTimeline";
import {
  PeriodFlowSheet,
  type PeriodFlowSubmit,
} from "@/components/mentor/plan-generator/PeriodFlowSheet";
import { LiveModeWorkspace } from "@/components/mentor/plan-generator/LiveModeWorkspace";
import { PeriodAdjustmentSheet } from "@/components/mentor/plan-generator/PeriodAdjustmentSheet";

import { getKnowledgeBase } from "@/services/documents";
import { listNewcomers } from "@/services/newcomers";
import { generatePlan, getPlan } from "@/services/plans";
import { getNewcomerJourney } from "@/services/journey";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import { fmtDate } from "@/lib/format";
import type { ID, JourneyPeriod, Newcomer, NewcomerJourney } from "@/types";

export default function PlanGeneratorEntryPage() {
  const { mentorId, newcomerId } = useDemo();
  const qc = useQueryClient();

  const [selectedNewcomerId, setSelectedNewcomerId] = React.useState<ID | null>(null);
  const [defaultSources, setDefaultSources] = React.useState<Set<ID>>(new Set());
  const [flowOpen, setFlowOpen] = React.useState(false);
  const [adjustPeriod, setAdjustPeriod] = React.useState<JourneyPeriod | null>(null);
  const [liveSession, setLiveSession] = React.useState<{
    notes: string;
    label: string;
    goal: string;
    sources: Set<ID>;
  } | null>(null);
  const [mentorNotes, setMentorNotes] = React.useState(
    "Backend-leaning. Strong on APIs + SQL, weaker on deployment + infra. Lighter week 1 if possible.",
  );

  const newcomersQ = useQuery({
    queryKey: ["newcomers", mentorId],
    queryFn: () => listNewcomers(mentorId),
  });
  const kbQ = useQuery({ queryKey: ["kb"], queryFn: getKnowledgeBase });

  const activeNewcomer =
    newcomersQ.data?.find((n) => n.id === selectedNewcomerId) ??
    newcomersQ.data?.find((n) => n.id === newcomerId) ??
    newcomersQ.data?.[0];

  React.useEffect(() => {
    if (!selectedNewcomerId && activeNewcomer) {
      queueMicrotask(() => setSelectedNewcomerId(activeNewcomer.id));
    }
  }, [activeNewcomer, selectedNewcomerId]);

  // Auto-pick a sensible set of sources by domain once knowledge base loads.
  React.useEffect(() => {
    if (!kbQ.data || defaultSources.size > 0) return;
    queueMicrotask(() => {
      const initial = new Set<ID>();
      kbQ.data?.groups.forEach((g) => g.documents.slice(0, 5).forEach((d) => initial.add(d.id)));
      setDefaultSources(initial);
    });
  }, [kbQ.data, defaultSources.size]);

  const journeyQ = useQuery<NewcomerJourney>({
    queryKey: ["journey", activeNewcomer?.id],
    queryFn: () => getNewcomerJourney(activeNewcomer!.id),
    enabled: !!activeNewcomer,
  });

  const generateMut = useMutation({
    mutationFn: (input: { input: PeriodFlowSubmit; newcomerIdFinal: ID }) =>
      generatePlan({
        newcomer_id: input.newcomerIdFinal,
        mentor_notes: buildMentorNotes(mentorNotes, input.input.notes, "classic"),
        document_ids: Array.from(input.input.sources),
        period_label: input.input.label.trim() || undefined,
        period_start: input.input.start || undefined,
        period_end: input.input.end || undefined,
        goal: input.input.goal.trim() || undefined,
      }),
    onSuccess: async (resp) => {
      toast.success("Draft generated", {
        description: `${resp.tasks_count} tasks ready for review.`,
      });
      qc.invalidateQueries({ queryKey: ["journey", activeNewcomer?.id] });
      qc.invalidateQueries({ queryKey: ["onboarding-plans", activeNewcomer?.id] });
      // Preload the new plan for the workspace nav.
      try {
        await qc.prefetchQuery({
          queryKey: ["plan", resp.plan_id],
          queryFn: () => getPlan(resp.plan_id),
        });
      } catch {
        /* noop */
      }
    },
    onError: (err) =>
      toast.error("Plan generation failed", { description: toApiError(err).message }),
  });

  const liveCommitMut = useMutation({
    mutationFn: (notesFinal: string) =>
      generatePlan({
        newcomer_id: activeNewcomer!.id,
        mentor_notes: buildMentorNotes(mentorNotes, notesFinal, "live"),
        document_ids: liveSession ? Array.from(liveSession.sources) : Array.from(defaultSources),
        period_label: liveSession?.label,
        goal: liveSession?.goal || undefined,
      }),
    onSuccess: (resp) => {
      toast.success("Live draft generated", {
        description: `${resp.tasks_count} tasks ready for review.`,
      });
      qc.invalidateQueries({ queryKey: ["journey", activeNewcomer?.id] });
      setLiveSession(null);
    },
    onError: (err) =>
      toast.error("Live generation failed", { description: toApiError(err).message }),
  });

  const handleFlowSubmit = (input: PeriodFlowSubmit) => {
    if (!activeNewcomer) return;
    setFlowOpen(false);
    if (input.mode === "live") {
      setLiveSession({
        notes: input.notes,
        label: input.label,
        goal: input.goal,
        sources: input.sources,
      });
    } else {
      generateMut.mutate({ input, newcomerIdFinal: activeNewcomer.id });
    }
  };

  const journey = journeyQ.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="AI Plan Generator"
        title={
          <>
            Build the onboarding <span className="ai-gradient-text">journey</span>
          </>
        }
        description="Start small, grow period by period. Each chapter can be generated live or fast, then refined."
        actions={
          <NewcomerSelector
            newcomers={newcomersQ.data ?? []}
            activeId={activeNewcomer?.id}
            onSelect={setSelectedNewcomerId}
          />
        }
      />

      {/* Journey timeline (centerpiece) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        data-demo-id="plan-generator-journey"
      >
        {journeyQ.isLoading ? (
          <Skeleton className="h-[280px] rounded-[18px]" />
        ) : journey && activeNewcomer ? (
          <JourneyTimeline
            journey={journey}
            onAddPeriod={() => setFlowOpen(true)}
            onAdjustPeriod={setAdjustPeriod}
          />
        ) : (
          <EmptyState
            icon={Compass}
            title="Pick a newcomer to see their journey"
            description="The timeline appears once a newcomer is selected. From there, every period is one click away."
          />
        )}
      </motion.div>

      {/* Snapshot + mentor intent */}
      <div className="grid gap-5 lg:grid-cols-3">
        <NewcomerSnapshot newcomer={activeNewcomer} loading={!activeNewcomer && newcomersQ.isLoading} />
        <MentorIntentCard
          notes={mentorNotes}
          onChange={setMentorNotes}
          className="lg:col-span-2"
        />
      </div>

      {/* Journey stats */}
      {journey ? <JourneyStats journey={journey} /> : null}

      {/* Live mode session overlay (rendered above everything when active) */}
      {liveSession && activeNewcomer ? (
        <LiveModeWorkspace
          newcomer={activeNewcomer}
          periodLabel={liveSession.label}
          periodGoal={liveSession.goal}
          mentorNotes={liveSession.notes}
          selectedSourcesCount={liveSession.sources.size}
          generating={liveCommitMut.isPending}
          onClose={() => setLiveSession(null)}
          onCommit={(notes) => liveCommitMut.mutate(notes)}
        />
      ) : null}

      {/* Period creation sheet */}
      <PeriodFlowSheet
        open={flowOpen}
        onClose={() => setFlowOpen(false)}
        newcomer={activeNewcomer}
        journey={journey}
        initialNotes={mentorNotes}
        initialSources={defaultSources}
        onSubmit={handleFlowSubmit}
      />

      <PeriodAdjustmentSheet
        open={!!adjustPeriod}
        onClose={() => setAdjustPeriod(null)}
        newcomerId={activeNewcomer?.id ?? null}
        newcomerName={activeNewcomer?.full_name}
        period={adjustPeriod}
      />
    </div>
  );
}

/* ---------- supporting components ---------- */

function NewcomerSelector({
  newcomers,
  activeId,
  onSelect,
}: {
  newcomers: { id: ID; full_name?: string }[];
  activeId?: ID;
  onSelect: (id: ID) => void;
}) {
  if (newcomers.length === 0) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/mentor/newcomers/new">
          <Users className="h-3.5 w-3.5" /> Add newcomer
        </Link>
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Select value={String(activeId ?? "")} onValueChange={(v) => onSelect(Number(v))}>
        <SelectTrigger className="h-9 min-w-[220px] rounded-full border-[color:var(--color-border-strong)] bg-white pl-3 pr-2">
          <span className="inline-flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full ai-gradient text-white">
              <Sparkles className="h-3 w-3" />
            </span>
            <SelectValue placeholder="Choose a newcomer" />
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </SelectTrigger>
        <SelectContent>
          {newcomers.map((n) => (
            <SelectItem key={n.id} value={String(n.id)}>
              {n.full_name ?? `Newcomer #${n.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function NewcomerSnapshot({
  newcomer,
  loading,
}: {
  newcomer: Newcomer | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }
  if (!newcomer) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-[color:var(--color-fg-muted)]">
          Choose a newcomer to see their snapshot here.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <div className="ai-gradient h-1 w-full" />
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          <Target className="h-3 w-3 text-[color:var(--color-primary)]" /> Newcomer snapshot
        </div>
        <div>
          <div className="text-base font-semibold text-[color:var(--color-fg)]">
            {newcomer.full_name ?? `Newcomer #${newcomer.id}`}
          </div>
          <div className="text-xs text-[color:var(--color-fg-muted)]">
            {newcomer.job_title} · {newcomer.seniority} · {newcomer.team}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <Stat label="Start" value={fmtDate(newcomer.start_date)} />
          <Stat label="Status" value={newcomer.onboarding_status ?? "—"} />
          {newcomer.known_skills ? <Stat label="Strong on" value={newcomer.known_skills} wide /> : null}
          {newcomer.known_gaps ? <Stat label="Gaps" value={newcomer.known_gaps} wide /> : null}
        </dl>
        {newcomer.main_goal ? (
          <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              Main goal
            </div>
            <p className="mt-1 text-sm text-[color:var(--color-fg)]">{newcomer.main_goal}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MentorIntentCard({
  notes,
  onChange,
  className,
}: {
  notes: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            <Edit3 className="h-3 w-3 text-[color:var(--color-primary)]" /> Mentor intent
          </div>
          <Badge tone="ai" size="sm">
            <Sparkles className="h-3 w-3" /> Steers every generation
          </Badge>
        </div>
        <p className="text-xs text-[color:var(--color-fg-muted)]">
          These notes are pinned. They&apos;ll travel with every period you generate, until you change them.
        </p>
        <Textarea
          rows={5}
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Backend-leaning, weak on infra. Lighter week 1 (intros booked). Prefer 30-min reading tasks."
        />
      </CardContent>
    </Card>
  );
}

function JourneyStats({ journey }: { journey: NewcomerJourney }) {
  const totalTasks = journey.periods.reduce((acc, p) => acc + p.tasks_total, 0);
  const doneTasks = journey.periods.reduce((acc, p) => acc + p.tasks_done, 0);
  const drafts = journey.periods.filter((p) => p.status === "draft").length;
  const approved = journey.periods.filter((p) => p.status === "approved").length;
  const missing = journey.periods.reduce((acc, p) => acc + (p.missing_context?.length ?? 0), 0);

  const items = [
    { icon: ListChecks, label: "Total tasks", value: totalTasks },
    { icon: Sparkles, label: "Done", value: `${doneTasks}/${totalTasks}` },
    { icon: CalendarDays, label: "Approved periods", value: approved },
    { icon: Edit3, label: "Drafts", value: drafts },
    { icon: AlertCircle, label: "Missing context", value: missing },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-3 p-5 sm:grid-cols-5">
        {items.map((it, idx) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              <it.icon className="h-3 w-3" /> {it.label}
            </div>
            <div className="mt-1 text-xl font-semibold text-[color:var(--color-fg)]">{it.value}</div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-md bg-[color:var(--color-surface-muted)] px-2 py-2 ${wide ? "col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">{label}</div>
      <div className="mt-0.5 truncate text-xs font-medium text-[color:var(--color-fg)]">{value}</div>
    </div>
  );
}

function buildMentorNotes(base: string, addendum: string, mode: "classic" | "live") {
  return [
    base.trim(),
    addendum.trim() ? `Period brief:\n${addendum.trim()}` : "",
    `Generation mode: ${mode === "live" ? "live reviewed" : "fast draft"}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
