"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { getKnowledgeBase } from "@/services/documents";
import { listNewcomers, getNewcomerPlan } from "@/services/newcomers";
import { generatePlan } from "@/services/plans";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";
import { fmtDate } from "@/lib/format";
import type { ID } from "@/types";

export default function PlanGeneratorEntryPage() {
  const router = useRouter();
  const { mentorId, newcomerId } = useDemo();
  const [selectedNewcomerId, setSelectedNewcomerId] = React.useState<ID | null>(null);

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
  const [defaultsApplied, setDefaultsApplied] = React.useState(false);
  const [mentorNotes, setMentorNotes] = React.useState(
    "Backend-leaning. Strong on APIs + SQL, weaker on deployment + infra. First two weeks should target the first PR.",
  );

  if (kb && !defaultsApplied && selectedDocs.size === 0) {
    const all = new Set<ID>();
    kb.groups.forEach((g) => g.documents.slice(0, 5).forEach((d) => all.add(d.id)));
    setDefaultsApplied(true);
    setSelectedDocs(all);
  }

  const generateMut = useMutation({
    mutationFn: () =>
      generatePlan({
        newcomer_id: activeNewcomer!.id,
        mentor_notes: mentorNotes,
        document_ids: Array.from(selectedDocs),
      }),
    onSuccess: (resp) => {
      toast.success("Plan generated", {
        description: `${resp.tasks_count} tasks · taking you to the workspace.`,
      });
      router.push(`/mentor/plan-generator/${resp.plan_id}`);
    },
    onError: (err) =>
      toast.error("Plan generation failed", { description: toApiError(err).message }),
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

          <Button
            variant="ai"
            size="lg"
            className="w-full"
            disabled={!activeNewcomer || generateMut.isPending}
            onClick={() => generateMut.mutate()}
          >
            <Wand2 className="h-4 w-4" />
            {generateMut.isPending ? "AI is drafting…" : "Generate plan"}
          </Button>
        </aside>

        <section className="space-y-5">
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
          ) : !activeNewcomer ? (
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
