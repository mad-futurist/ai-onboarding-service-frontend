"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  RefreshCcw,
  Check,
  Edit3,
  FileText,
  Target,
  GitBranch,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { PlanPhaseCard } from "@/components/mentor/PlanPhaseCard";
import { EmptyState } from "@/components/shared/EmptyState";

import { getKnowledgeBase } from "@/services/documents";
import { listNewcomers, getNewcomerPlan } from "@/services/newcomers";
import { approvePlan, generatePlan, getPlan } from "@/services/plans";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import { fmtDate } from "@/lib/format";
import type { ID, OnboardingPlanWithTasks } from "@/types";

export default function PlanGeneratorPage() {
  const qc = useQueryClient();
  const { mentorId, newcomerId } = useDemo();
  const [selectedNewcomerId, setSelectedNewcomerId] = React.useState<ID | null>(null);

  const { data: newcomers } = useQuery({ queryKey: ["newcomers", mentorId], queryFn: () => listNewcomers(mentorId) });
  const { data: kb } = useQuery({ queryKey: ["kb"], queryFn: getKnowledgeBase });

  const activeNewcomer =
    newcomers?.find((n) => n.id === selectedNewcomerId) ??
    newcomers?.find((n) => n.id === newcomerId) ??
    newcomers?.[0];

  const [selectedDocs, setSelectedDocs] = React.useState<Set<ID>>(new Set());
  const [mentorNotes, setMentorNotes] = React.useState(
    "Backend-leaning. Strong on APIs + SQL, weaker on deployment + infra. First two weeks should target the first PR.",
  );
  const [plan, setPlan] = React.useState<OnboardingPlanWithTasks | null>(null);

  React.useEffect(() => {
    if (!selectedNewcomerId && activeNewcomer) {
      queueMicrotask(() => setSelectedNewcomerId(activeNewcomer.id));
    }
  }, [activeNewcomer, selectedNewcomerId]);

  // Try to load existing plan if any
  const existingPlan = useQuery({
    queryKey: ["newcomer-plan", activeNewcomer?.id],
    queryFn: () => getNewcomerPlan(activeNewcomer!.id),
    enabled: !!activeNewcomer,
    retry: false,
  });
  React.useEffect(() => {
    queueMicrotask(() => setPlan(existingPlan.data ?? null));
  }, [activeNewcomer?.id, existingPlan.data]);

  React.useEffect(() => {
    if (kb && selectedDocs.size === 0) {
      const all = new Set<ID>();
      kb.groups.forEach((g) => g.documents.slice(0, 5).forEach((d) => all.add(d.id)));
      setSelectedDocs(all);
    }
  }, [kb, selectedDocs.size]);

  const generateMut = useMutation({
    mutationFn: () =>
      generatePlan({
        newcomer_id: activeNewcomer!.id,
        mentor_notes: mentorNotes,
        document_ids: Array.from(selectedDocs),
      }),
    onSuccess: async (resp) => {
      toast.success("Plan generated", {
        description: `${resp.tasks_count} tasks across 30/60/90 phases${resp.used_fallback ? " (fallback mode)" : ""}.`,
      });
      const full = await getPlan(resp.plan_id);
      setPlan(full);
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["mentor-dashboard"] });
    },
    onError: (err) => toast.error("Plan generation failed", { description: toApiError(err).message }),
  });

  const approveMut = useMutation({
    mutationFn: () => approvePlan(plan!.id),
    onSuccess: () => {
      toast.success("Plan approved", { description: "The newcomer can now see their plan." });
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["mentor-dashboard"] });
      if (plan) setPlan({ ...plan, status: "approved", mentor_approved: true });
    },
    onError: (err) => toast.error("Approve failed", { description: toApiError(err).message }),
  });

  const toggleDoc = (id: ID) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tasksByPhase = React.useMemo(() => {
    const all = plan?.tasks ?? [];
    const phase1 = all.filter((t) => (t.day_number ?? (t.week_number ?? 1) * 7) <= 30);
    const phase2 = all.filter(
      (t) => (t.day_number ?? (t.week_number ?? 1) * 7) > 30 && (t.day_number ?? (t.week_number ?? 1) * 7) <= 60,
    );
    const phase3 = all.filter((t) => (t.day_number ?? (t.week_number ?? 1) * 7) > 60);
    return { phase1, phase2, phase3 };
  }, [plan]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="AI Plan Generator"
        title={
          <>
            Generate a personalized <span className="ai-gradient-text">30/60/90</span> plan
          </>
        }
        description="AI drafts a phase-by-phase plan based on the newcomer's profile and selected sources. You stay in control — review, edit, approve."
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[color:var(--color-primary)]" /> Newcomer profile
              </CardTitle>
              <CardDescription>The AI tailors the plan around this profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {newcomers?.length ? (
                <div className="space-y-1.5">
                  <Label>Generate for</Label>
                  <Select
                    value={String(activeNewcomer?.id ?? "")}
                    onValueChange={(value) => setSelectedNewcomerId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a newcomer" />
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
              ) : null}
              {activeNewcomer ? (
                <dl className="space-y-2 text-sm">
                  <Row label="Name" value={activeNewcomer.full_name ?? "—"} />
                  <Row label="Role" value={activeNewcomer.job_title} />
                  <Row label="Seniority" value={activeNewcomer.seniority} />
                  <Row label="Team" value={activeNewcomer.team} />
                  <Row label="Start" value={fmtDate(activeNewcomer.start_date)} />
                  {activeNewcomer.main_goal ? <Row label="Goal" value={activeNewcomer.main_goal} /> : null}
                </dl>
              ) : (
                <Skeleton className="h-32" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[color:var(--color-primary)]" /> Selected sources
              </CardTitle>
              <CardDescription>{selectedDocs.size} document{selectedDocs.size !== 1 ? "s" : ""} selected</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto pr-2">
              <ul className="space-y-1">
                {kb?.groups.flatMap((g) => g.documents).map((doc) => (
                  <li key={doc.id} className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-[color:var(--color-surface-muted)]">
                    <Checkbox
                      id={`doc-${doc.id}`}
                      checked={selectedDocs.has(doc.id)}
                      onCheckedChange={() => toggleDoc(doc.id)}
                      className="mt-0.5"
                    />
                    <Label htmlFor={`doc-${doc.id}`} className="flex-1 cursor-pointer text-sm">
                      <div className="text-[color:var(--color-fg)] truncate">{doc.title}</div>
                      <div className="text-[11px] text-[color:var(--color-fg-subtle)]">{doc.domain}</div>
                    </Label>
                  </li>
                ))}
                {!kb || kb.total === 0 ? (
                  <li className="text-xs text-[color:var(--color-fg-muted)] px-2 py-2">
                    No documents yet. <Link href="/mentor/knowledge" className="underline">Add some</Link>.
                  </li>
                ) : null}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-[color:var(--color-primary)]" /> Mentor notes
              </CardTitle>
              <CardDescription>Anything the AI should weight more heavily.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea rows={5} value={mentorNotes} onChange={(e) => setMentorNotes(e.target.value)} />
            </CardContent>
          </Card>

          <Button
            variant="ai"
            size="lg"
            className="w-full"
            disabled={!activeNewcomer || generateMut.isPending}
            onClick={() => generateMut.mutate()}
          >
            <Wand2 className="h-4 w-4" />
            {generateMut.isPending ? "AI is drafting…" : plan ? "Regenerate plan" : "Generate plan"}
          </Button>
        </aside>

        <section className="space-y-5">
          {!plan && !generateMut.isPending && !existingPlan.isLoading ? (
            <EmptyState
              icon={Sparkles}
              title="No plan yet"
              description={
                activeNewcomer
                  ? "Pick the documents the AI should ground the plan on, then click Generate plan."
                  : "Add a newcomer first to generate their plan."
              }
            />
          ) : null}

          {generateMut.isPending || existingPlan.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : null}

          {plan ? (
            <>
              <AIInsightCard
                title={`${activeNewcomer?.full_name ?? "Selected newcomer"} · ${plan.title}`}
                description={compactPlanDescription(plan.description)}
                confidence={plan.ai_confidence ?? 82}
                tone="soft"
                actions={
                  <>
                    {plan.mentor_approved ? (
                      <Badge tone="success" size="lg">
                        <Check className="h-3 w-3" /> Approved
                      </Badge>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateMut.mutate()}
                          disabled={generateMut.isPending}
                        >
                          <RefreshCcw className="h-3.5 w-3.5" /> Regenerate
                        </Button>
                        <Button size="sm" variant="ai" disabled={approveMut.isPending} onClick={() => approveMut.mutate()}>
                          <Check className="h-3.5 w-3.5" /> {approveMut.isPending ? "Approving…" : "Approve plan"}
                        </Button>
                      </>
                    )}
                  </>
                }
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <PhaseMeta label="First 30 days" value={tasksByPhase.phase1.length} hint="Orientation & first PR" />
                  <PhaseMeta label="Days 31-60" value={tasksByPhase.phase2.length} hint="Own small feature" />
                  <PhaseMeta label="Days 61-90" value={tasksByPhase.phase3.length} hint="Independent work" />
                </div>
                {plan.missing_context?.length ? (
                  <div className="mt-4 rounded-lg border border-[color:var(--color-warning-soft)] bg-white p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-warning-fg)]">
                      <GitBranch className="h-3 w-3" /> Missing context
                    </div>
                    <ul className="mt-1 space-y-0.5 text-sm text-[color:var(--color-fg)]">
                      {plan.missing_context.map((m) => (
                        <li key={m}>· {m}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </AIInsightCard>

              <PlanPhaseCard title="First 30 days" subtitle="Orientation, setup, first PR" tasks={tasksByPhase.phase1} />
              <PlanPhaseCard title="Days 31-60" subtitle="Ownership of a small feature" tasks={tasksByPhase.phase2} />
              <PlanPhaseCard title="Days 61-90" subtitle="Independent work & team integration" tasks={tasksByPhase.phase3} />
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-[color:var(--color-fg-subtle)]">{label}</dt>
      <dd className="text-[color:var(--color-fg)] font-medium text-right truncate max-w-[60%]">{value}</dd>
    </div>
  );
}

function PhaseMeta({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">{label}</div>
      <div className="mt-1 text-xl font-semibold text-[color:var(--color-fg)]">{value}</div>
      <div className="text-xs text-[color:var(--color-fg-muted)]">{hint}</div>
    </div>
  );
}

function compactPlanDescription(description?: string | null) {
  if (!description) return "AI-generated 30/60/90 plan.";
  return description.split("\n\n")[0] || description;
}
