"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  ArrowRight,
  Target,
  FileText,
  Edit3,
  Users,
  ListChecks,
  CalendarDays,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { SourcesPicker } from "@/components/mentor/plan-generator/SourcesPicker";
import { RealtimePlanWorkspace } from "@/components/mentor/plan-generator/RealtimePlanWorkspace";

import { getKnowledgeBase } from "@/services/documents";
import { listNewcomers, getNewcomerPlan } from "@/services/newcomers";
import { generatePlan, getPlan } from "@/services/plans";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import { fmtDate } from "@/lib/format";
import type { ID, OnboardingPlanWithTasks } from "@/types";

export default function PlanGeneratorEntryPage() {
  const { mentorId, newcomerId } = useDemo();
  const [selectedNewcomerId, setSelectedNewcomerId] = React.useState<ID | null>(null);
  const [generatedPlanId, setGeneratedPlanId] = React.useState<ID | null>(null);

  const { data: newcomers } = useQuery({
    queryKey: ["newcomers", mentorId],
    queryFn: () => listNewcomers(mentorId),
  });
  const { data: kb } = useQuery({ queryKey: ["kb"], queryFn: getKnowledgeBase });

  const activeNewcomer =
    newcomers?.find((n) => n.id === selectedNewcomerId) ??
    newcomers?.find((n) => n.id === newcomerId) ??
    newcomers?.[0];

  const existingPlan = useQuery({
    queryKey: ["newcomer-plan", activeNewcomer?.id],
    queryFn: () => getNewcomerPlan(activeNewcomer!.id),
    enabled: !!activeNewcomer,
    retry: false,
  });

  React.useEffect(() => {
    if (!selectedNewcomerId && activeNewcomer) {
      queueMicrotask(() => setSelectedNewcomerId(activeNewcomer.id));
    }
  }, [activeNewcomer, selectedNewcomerId]);

  const [selectedDocs, setSelectedDocs] = React.useState<Set<ID>>(new Set());
  const defaultsAppliedRef = React.useRef(false);
  const [mentorNotes, setMentorNotes] = React.useState(
    "Backend-leaning. Strong on APIs + SQL, weaker on deployment + infra. First two weeks should target the first PR.",
  );
  React.useEffect(() => {
    if (!kb || defaultsAppliedRef.current || selectedDocs.size > 0) return;
    const all = new Set<ID>();
    kb.groups.forEach((g) => g.documents.slice(0, 5).forEach((d) => all.add(d.id)));
    defaultsAppliedRef.current = true;
    queueMicrotask(() => setSelectedDocs(all));
  }, [kb, selectedDocs.size]);

  const generateMut = useMutation({
    mutationFn: (input: { mentorNotes: string; mode: "classic" | "live" }) =>
      generatePlan({
        newcomer_id: activeNewcomer!.id,
        mentor_notes: input.mentorNotes,
        document_ids: Array.from(selectedDocs),
      }),
    onSuccess: (resp) => {
      setGeneratedPlanId(resp.plan_id);
      toast.success("Plan generated", {
        description: `${resp.tasks_count} tasks · taking you to the workspace.`,
      });
    },
    onError: (err) =>
      toast.error("Plan generation failed", { description: toApiError(err).message }),
  });

  const generatedPlan = useQuery({
    queryKey: ["plan", generatedPlanId],
    queryFn: () => getPlan(generatedPlanId!),
    enabled: generatedPlanId != null,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="AI Plan Generator"
        title={
          <>
            Draft a <span className="ai-gradient-text">30/60/90</span> plan for your newcomer
          </>
        }
        description="Pick a newcomer, point the AI at the right sources, add steering notes. You get a plan you can refine in the workspace — weeks, tasks, sources, all editable."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[color:var(--color-primary)]" /> Who is the plan for?
              </CardTitle>
              <CardDescription>The AI tailors content to this profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {newcomers?.length ? (
                <div className="space-y-1.5">
                  <Label>Newcomer</Label>
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
                  <Row label="Role" value={activeNewcomer.job_title} />
                  <Row label="Seniority" value={activeNewcomer.seniority} />
                  <Row label="Team" value={activeNewcomer.team} />
                  <Row label="Start" value={fmtDate(activeNewcomer.start_date)} />
                  {activeNewcomer.main_goal ? (
                    <Row label="Goal" value={activeNewcomer.main_goal} />
                  ) : null}
                </dl>
              ) : (
                <Skeleton className="h-32" />
              )}
              {!newcomers?.length ? (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/mentor/newcomers/new">
                    <Users className="h-3.5 w-3.5" /> Add a newcomer first
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-[color:var(--color-primary)]" /> Steering notes
              </CardTitle>
              <CardDescription>Anything the AI should weight more heavily.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={mentorNotes}
                onChange={(e) => setMentorNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <div>
                <div className="text-sm font-semibold text-[color:var(--color-fg)]">
                  Classic generation
                </div>
                <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                  Generate immediately with the notes and sources, without live review.
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled={!activeNewcomer || generateMut.isPending}
                onClick={() => generateMut.mutate({ mentorNotes, mode: "classic" })}
              >
                <Wand2 className="h-4 w-4" />
                {generateMut.isPending ? "Generating..." : "Generate plan now"}
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-5">
          <RealtimePlanWorkspace
            newcomer={activeNewcomer}
            selectedDocumentCount={selectedDocs.size}
            mentorNotes={mentorNotes}
            generating={generateMut.isPending}
            onGenerate={(liveMentorNotes) =>
              generateMut.mutate({ mentorNotes: liveMentorNotes, mode: "live" })
            }
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[color:var(--color-primary)]" /> Sources the AI will use
              </CardTitle>
              <CardDescription>
                Selected documents anchor the AI&apos;s drafting. Toggle to refine — defaults to your most relevant docs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SourcesPicker
                selected={selectedDocs}
                onToggle={(id) =>
                  setSelectedDocs((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                onSelectAll={(ids) => setSelectedDocs(new Set(ids))}
                maxHeight="max-h-[420px]"
              />
            </CardContent>
          </Card>

          {generatedPlan.data ? (
            <PlanPreviewCard
              plan={generatedPlan.data}
              title="Generated draft"
              description="The draft is ready. Inspect weeks and tasks here, then open the workspace to edit."
            />
          ) : null}

          {existingPlan.data ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" /> Existing plan
                </CardTitle>
                <CardDescription>
                  This newcomer already has a plan — jump straight to the workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/mentor/plan-generator/${existingPlan.data.id}`}
                  className="flex items-center justify-between rounded-lg border border-[color:var(--color-border)] p-3 hover:border-[color:var(--color-primary-ring)]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">
                      {existingPlan.data.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-[color:var(--color-fg-muted)]">
                      <Badge tone={existingPlan.data.mentor_approved ? "success" : "warning"} size="sm">
                        {existingPlan.data.status}
                      </Badge>
                      <span>{(existingPlan.data.tasks ?? []).length} tasks</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[color:var(--color-fg-faint)]" />
                </Link>
              </CardContent>
            </Card>
          ) : generatedPlan.data ? null : !activeNewcomer ? (
            <EmptyState
              icon={Sparkles}
              title="Add a newcomer to generate a plan"
              description="Plans are tailored to a specific newcomer's profile. Add one to get started."
            />
          ) : (
            <EmptyState
              icon={Wand2}
              title="No plan generated yet"
              description="Confirm the sources above, then click Generate plan. You'll be dropped straight into the workspace."
            />
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-[color:var(--color-fg-subtle)]">{label}</dt>
      <dd className="text-[color:var(--color-fg)] font-medium text-right truncate max-w-[60%]">
        {value}
      </dd>
    </div>
  );
}

function PlanPreviewCard({
  plan,
  title,
  description,
}: {
  plan: OnboardingPlanWithTasks;
  title: string;
  description: string;
}) {
  const tasks = plan.tasks ?? [];
  const weeks = groupTasksByWeek(tasks);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" /> {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button asChild variant="ai" size="sm">
            <Link href={`/mentor/plan-generator/${plan.id}`}>
              Open workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-[color:var(--color-border)] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">{plan.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-fg-muted)]">
                <Badge tone={plan.mentor_approved ? "success" : "warning"} size="sm">
                  {plan.status}
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> {weeks.length} week{weeks.length === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="h-3 w-3" /> {tasks.length} task{tasks.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {weeks.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {weeks.slice(0, 6).map((week) => (
              <div key={week.weekNumber} className="rounded-lg border border-[color:var(--color-border)] bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[color:var(--color-fg)]">Week {week.weekNumber}</div>
                  <Badge tone="neutral" size="sm">
                    {week.tasks.length} task{week.tasks.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <ul className="mt-2 space-y-1">
                  {week.tasks.slice(0, 3).map((task) => (
                    <li key={task.id} className="truncate text-xs text-[color:var(--color-fg-muted)]">
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[color:var(--color-border)] px-4 py-6 text-center text-sm text-[color:var(--color-fg-muted)]">
            No week numbers yet. Open the workspace to scaffold or edit weeks.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function groupTasksByWeek(tasks: OnboardingPlanWithTasks["tasks"]) {
  const grouped = new Map<number, OnboardingPlanWithTasks["tasks"]>();
  for (const task of tasks) {
    const weekNumber = task.week_number ?? 0;
    const list = grouped.get(weekNumber) ?? [];
    list.push(task);
    grouped.set(weekNumber, list);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([weekNumber, weekTasks]) => ({
      weekNumber,
      tasks: weekTasks.sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0)),
    }));
}
