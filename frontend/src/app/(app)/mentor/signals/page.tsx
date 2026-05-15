"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Filter, CalendarDays } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SignalRow } from "@/components/ai/SignalRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleMeetingDialog } from "@/components/meetings/ScheduleMeetingDialog";

import { detectSignals, ignoreSignal, listSignalsForNewcomer, resolveSignal } from "@/services/signals";
import { listNewcomers, getNewcomerPlan } from "@/services/newcomers";
import { useDemo } from "@/providers/demo-provider";
import { toApiError } from "@/lib/api";
import { AdjustPlanDialog } from "@/components/mentor/plan-generator/AdjustPlanDialog";
import type { AISignal, ID } from "@/types";

export default function SignalsCenterPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { mentorId, newcomerId } = useDemo();
  const [filter, setFilter] = React.useState<"open" | "resolved" | "ignored" | "all">("open");
  const [selectedNewcomerId, setSelectedNewcomerId] = React.useState<ID | null>(null);

  const { data: newcomers } = useQuery({ queryKey: ["newcomers", mentorId], queryFn: () => listNewcomers(mentorId) });
  const activeNewcomer =
    newcomers?.find((n) => n.id === selectedNewcomerId) ??
    newcomers?.find((n) => n.id === newcomerId) ??
    newcomers?.[0];

  React.useEffect(() => {
    if (!selectedNewcomerId && activeNewcomer) {
      queueMicrotask(() => setSelectedNewcomerId(activeNewcomer.id));
    }
  }, [activeNewcomer, selectedNewcomerId]);

  const { data, isLoading } = useQuery({
    queryKey: ["signals", activeNewcomer?.id, filter],
    queryFn: () => listSignalsForNewcomer(activeNewcomer!.id, filter === "all" ? undefined : filter),
    enabled: !!activeNewcomer,
  });

  const detectMut = useMutation({
    mutationFn: () => detectSignals(activeNewcomer!.id),
    onSuccess: (resp) => {
      toast.success(
        resp.created_count
          ? `${resp.created_count} new signal${resp.created_count > 1 ? "s" : ""}`
          : "No new signals",
      );
      qc.invalidateQueries({ queryKey: ["signals"] });
    },
    onError: (err) => toast.error("Detection failed", { description: toApiError(err).message }),
  });

  const resolveMut = useMutation({
    mutationFn: (id: number) => resolveSignal(id),
    onSuccess: () => {
      toast.success("Signal resolved");
      qc.invalidateQueries({ queryKey: ["signals"] });
    },
  });
  const ignoreMut = useMutation({
    mutationFn: (id: number) => ignoreSignal(id),
    onSuccess: () => {
      toast.success("Signal ignored");
      qc.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  const [schedSignal, setSchedSignal] = React.useState<AISignal | null>(null);
  const [schedOpen, setSchedOpen] = React.useState(false);
  const [adjustSignal, setAdjustSignal] = React.useState<AISignal | null>(null);
  const [adjustOpen, setAdjustOpen] = React.useState(false);

  // Look up the active plan for the active newcomer so the Adjust dialog knows
  // which plan to regenerate. Soft-fails (404) when the newcomer has no plan yet.
  const activePlan = useQuery({
    queryKey: ["newcomer-plan", activeNewcomer?.id],
    queryFn: () => getNewcomerPlan(activeNewcomer!.id),
    enabled: !!activeNewcomer,
    retry: false,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="AI Signals Center"
        title={
          <>
            What the <span className="ai-gradient-text">AI noticed</span> about your team
          </>
        }
        description="AI continuously watches engagement, blocked tasks, repeated questions, and access friction. Signals show before newcomers ask for help."
        actions={
          <>
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Button
              variant="ai"
              disabled={!activeNewcomer || detectMut.isPending}
              onClick={() => detectMut.mutate()}
            >
              <Sparkles className="h-4 w-4" />
              {detectMut.isPending ? "Scanning…" : "Run detection"}
            </Button>
          </>
        }
      />

      {newcomers?.length ? (
        <div className="max-w-sm space-y-1.5">
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

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="ignored">Ignored</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="space-y-3 pt-2">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : data && data.length ? (
            data.map((s) => (
              <SignalRow
                key={s.id}
                signal={s}
                onResolve={filter !== "resolved" && filter !== "ignored" ? (sig) => resolveMut.mutate(sig.id) : undefined}
                onIgnore={filter !== "resolved" && filter !== "ignored" ? (sig) => ignoreMut.mutate(sig.id) : undefined}
                onSchedule={(sig) => {
                  setSchedSignal(sig);
                  setSchedOpen(true);
                }}
                onAdjustPlan={(sig) => {
                  setAdjustSignal(sig);
                  setAdjustOpen(true);
                }}
                onMakeCourse={(sig) => {
                  if (!activeNewcomer) return;
                  const params = new URLSearchParams({
                    newcomerId: String(sig.newcomer_id ?? activeNewcomer.id),
                    roleTarget: normalizeRoleTarget(activeNewcomer.job_title),
                    prompt: buildSignalCoursePrompt(sig, activeNewcomer),
                  });
                  router.push(`/mentor/courses/new?${params.toString()}`);
                }}
              />
            ))
          ) : (
            <EmptyState
              title={filter === "open" ? "No open signals" : "Nothing here"}
              description={
                filter === "open"
                  ? "Everything looks calm. Run detection if you want a fresh sweep."
                  : "Switch filter to see other signals."
              }
              action={
                filter === "open" && activeNewcomer ? (
                  <Button variant="ai" onClick={() => detectMut.mutate()}>
                    <Sparkles className="h-4 w-4" /> Run detection
                  </Button>
                ) : null
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" /> How AI signals work
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
          The detector samples 12 features per newcomer — re-opened documents, blocked tasks,
          repeated questions, deploy hesitation, access issues — and surfaces what crosses a
          confidence threshold. You see the evidence and choose what to do.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/mentor">Back to dashboard</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/mentor/meetings">
              <CalendarDays className="h-3.5 w-3.5" /> Meetings
            </Link>
          </Button>
        </div>
      </div>

      <ScheduleMeetingDialog
        open={schedOpen}
        onOpenChange={setSchedOpen}
        signal={schedSignal}
        newcomerId={activeNewcomer?.id}
      />

      <AdjustPlanDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        signal={adjustSignal}
        planId={activePlan.data?.id ?? null}
        newcomerName={activeNewcomer?.full_name ?? undefined}
      />
    </div>
  );
}

function normalizeRoleTarget(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function buildSignalCoursePrompt(
  signal: AISignal,
  newcomer: { full_name?: string; job_title: string; seniority: string; team: string },
): string {
  const evidence = signal.evidence ? ` Evidence: ${signal.evidence}` : "";
  const suggestedAction = signal.suggested_action
    ? ` Suggested action: ${signal.suggested_action}`
    : "";

  return [
    `Create a short onboarding course for ${newcomer.full_name ?? "this newcomer"}.`,
    `Role: ${newcomer.seniority} ${newcomer.job_title} on the ${newcomer.team} team.`,
    `Course focus: ${signal.title}.`,
    signal.description ? `Context: ${signal.description}` : "",
    `${evidence}${suggestedAction}`.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}
