"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ListChecks, FileText, Wand2, Plus, Loader2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { createWeek, listSprints, listWeeks } from "@/services/plans";
import { listAdjustmentsForNewcomer } from "@/services/plan-adjustments";
import { WeeksTree } from "./WeeksTree";
import { AdjustmentsList } from "./AdjustmentsList";
import { SourcesPicker } from "./SourcesPicker";
import type { OnboardingPlanWithTasks, ID } from "@/types";

interface WorkspaceTabsProps {
  plan: OnboardingPlanWithTasks;
  selectedDocs: Set<ID>;
  onToggleDoc: (id: ID) => void;
  onSelectAllDocs: (ids: ID[]) => void;
}

export function WorkspaceTabs({
  plan,
  selectedDocs,
  onToggleDoc,
  onSelectAllDocs,
}: WorkspaceTabsProps) {
  const qc = useQueryClient();
  const { data: weeks, isLoading: weeksLoading } = useQuery({
    queryKey: ["plan-weeks", plan.id],
    queryFn: () => listWeeks(plan.id),
  });
  const { data: sprints } = useQuery({
    queryKey: ["plan-sprints", plan.id],
    queryFn: () => listSprints(plan.id),
  });
  const { data: adjustments } = useQuery({
    queryKey: ["plan-adjustments", plan.newcomer_id],
    queryFn: () =>
      plan.newcomer_id ? listAdjustmentsForNewcomer(plan.newcomer_id) : Promise.resolve([]),
    enabled: !!plan.newcomer_id,
  });

  const tasks = React.useMemo(() => plan.tasks ?? [], [plan.tasks]);

  // Auto-scaffold Week records if the AI plan only produced week_numbers
  // (the AI plan generator writes week_number but not Week rows yet).
  const scaffoldMut = useMutation({
    mutationFn: async (weekNumbers: number[]) => {
      // Sequential to keep order deterministic.
      for (const n of weekNumbers) {
        await createWeek(plan.id, {
          index: n,
          title: `Week ${n}`,
          summary: null,
          goals: null,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan-weeks", plan.id] });
    },
    // Don't toast errors — the virtual-week fallback in WeeksTree keeps the UI usable.
    onError: () => {},
  });

  const taskWeeks = React.useMemo(
    () =>
      Array.from(
        new Set(tasks.map((t) => t.week_number).filter((n): n is number => !!n && n > 0)),
      ).sort((a, b) => a - b),
    [tasks],
  );

  // Ref-based guard (not setState during render) so the effect actually fires
  // when weeks=[] and we have week_numbers in the tasks.
  const scaffoldStartedRef = React.useRef(false);
  React.useEffect(() => {
    if (scaffoldStartedRef.current) return;
    if (weeksLoading || !weeks) return;
    if (weeks.length > 0) return;
    if (taskWeeks.length === 0) return;
    scaffoldStartedRef.current = true;
    scaffoldMut.mutate(taskWeeks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeksLoading, weeks, taskWeeks]);

  const manualScaffold = () => {
    scaffoldStartedRef.current = true;
    scaffoldMut.mutate(taskWeeks);
  };

  return (
    <Tabs defaultValue="weeks">
      <TabsList className="bg-white border border-[color:var(--color-border)]">
        <TabsTrigger value="weeks" className="gap-2">
          <CalendarDays className="h-3.5 w-3.5" /> Weeks
          {weeks?.length ? (
            <Badge tone="neutral" size="sm" className="ml-1">
              {weeks.length}
            </Badge>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="tasks" className="gap-2" data-demo-id="plan-workspace-all-tasks-tab">
          <ListChecks className="h-3.5 w-3.5" /> All tasks
          {tasks.length ? (
            <Badge tone="neutral" size="sm" className="ml-1">
              {tasks.length}
            </Badge>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="sources" className="gap-2">
          <FileText className="h-3.5 w-3.5" /> Sources
          <Badge tone="neutral" size="sm" className="ml-1">
            {selectedDocs.size}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="adjustments" className="gap-2">
          <Wand2 className="h-3.5 w-3.5" /> Adjustments
          {adjustments?.length ? (
            <Badge tone="ai" size="sm" className="ml-1">
              {adjustments.length}
            </Badge>
          ) : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="weeks" className="mt-4 space-y-3">
        {weeksLoading ? (
          <div className="rounded-lg border border-dashed border-[color:var(--color-border)] bg-white px-4 py-6 text-center text-sm text-[color:var(--color-fg-muted)]">
            <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
            Loading weeks…
          </div>
        ) : (
          <WeeksTree
            planId={plan.id}
            weeks={weeks ?? []}
            sprints={sprints}
            tasks={tasks}
            onScaffoldFromTasks={manualScaffold}
            scaffolding={scaffoldMut.isPending}
          />
        )}
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All tasks</CardTitle>
                <CardDescription>
                  Flat view of every task across phases. Click a task to edit it.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {tasks
                .slice()
                .sort(
                  (a, b) =>
                    (a.week_number ?? 0) - (b.week_number ?? 0) ||
                    (a.day_number ?? 0) - (b.day_number ?? 0),
                )
                .map((t, taskIndex) => (
                  <li key={t.id}>
                    <Link
                      href={`/mentor/plan-generator/${plan.id}/task/${t.id}`}
                      data-demo-alt-id={taskIndex === 0 ? "plan-workspace-first-task" : undefined}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm hover:border-[color:var(--color-primary-ring)]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {t.week_number ? (
                            <Badge tone="neutral" size="sm">W{t.week_number}</Badge>
                          ) : null}
                          <span className="truncate font-medium text-[color:var(--color-fg)]">
                            {t.title}
                          </span>
                        </div>
                        {t.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--color-fg-muted)]">
                            {t.description}
                          </p>
                        ) : null}
                      </div>
                      <Badge tone={priorityTone(t.priority)} size="sm">
                        {t.priority}
                      </Badge>
                    </Link>
                  </li>
                ))}
              {!tasks.length ? (
                <li className="rounded-lg border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-[color:var(--color-fg-muted)]">
                  No tasks. Regenerate the plan to scaffold tasks.
                </li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sources" className="mt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sources the AI will use</CardTitle>
                <CardDescription>
                  Selected documents anchor regenerations. Toggle freely.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/mentor/knowledge">
                  <Plus className="h-3.5 w-3.5" /> Add to KB
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SourcesPicker
              selected={selectedDocs}
              onToggle={onToggleDoc}
              onSelectAll={onSelectAllDocs}
              maxHeight="max-h-[480px]"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="adjustments" className="mt-4">
        <AdjustmentsList planId={plan.id} adjustments={adjustments ?? []} />
      </TabsContent>
    </Tabs>
  );
}

function priorityTone(p: string): "neutral" | "warning" | "danger" | "info" {
  if (p === "high") return "danger";
  if (p === "medium") return "warning";
  if (p === "low") return "info";
  return "neutral";
}
