"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Network, Activity, List, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

import { SignalsArborescence } from "@/components/ai/signals-tree/SignalsArborescence";
import { SignalsStoryPipeline } from "@/components/ai/signals-tree/SignalsStoryPipeline";
import { SignalDetailDrawer } from "@/components/ai/signals-tree/SignalDetailDrawer";
import { SignalRow } from "@/components/ai/SignalRow";
import { fireConfetti } from "@/components/ai/signals-tree/confetti";
import { toneOf } from "@/components/ai/signals-tree/toneClasses";

import { listSignalsForMe } from "@/services/signals";
import { useDemo } from "@/providers/demo-provider";
import type { AISignal, ID } from "@/types";

type View = "tree" | "story" | "list";

export default function NewcomerSignalsPage() {
  const { newcomerId, newcomerName, mentorName } = useDemo();
  const [view, setView] = React.useState<View>("tree");
  const [drawerSignal, setDrawerSignal] = React.useState<AISignal | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["signals-me", newcomerId],
    queryFn: () => listSignalsForMe(newcomerId!),
    enabled: !!newcomerId,
  });

  const seenPositiveRef = React.useRef<Set<ID>>(new Set());
  React.useEffect(() => {
    if (!data) return;
    const freshPositive = data.find(
      (s) =>
        toneOf(s) === "positive" &&
        !seenPositiveRef.current.has(s.id) &&
        Date.now() - new Date(s.created_at).getTime() < 60_000,
    );
    for (const s of data) seenPositiveRef.current.add(s.id);
    if (freshPositive) fireConfetti();
  }, [data]);

  const openDrawer = (sig: AISignal) => {
    setDrawerSignal(sig);
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="What AI sees in your journey"
        title={
          <>
            Your <span className="ai-gradient-text">signals</span>
          </>
        }
        description={`The AI watches your progress, blockers, and wins, ${newcomerName?.split(" ")[0] ?? "there"}. Here's what it noticed — leave a note if something feels off.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/newcomer">Back home</Link>
          </Button>
        }
      />

      <div className="flex justify-end">
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList>
            <TabsTrigger value="tree">
              <Network className="h-3.5 w-3.5" /> Tree
            </TabsTrigger>
            <TabsTrigger value="story">
              <Activity className="h-3.5 w-3.5" /> Story
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-3.5 w-3.5" /> List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : data && data.length ? (
        view === "tree" ? (
          <SignalsArborescence
            signals={data}
            audience="newcomer"
            onSelectSignal={openDrawer}
            planTitle={`${newcomerName ?? "Your"} onboarding`}
          />
        ) : view === "story" ? (
          <SignalsStoryPipeline signals={data} audience="newcomer" onSelectSignal={openDrawer} />
        ) : (
          <div className="space-y-3">
            {data.map((s) => (
              <SignalRow key={s.id} signal={s} />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="AI is still learning your rhythm"
          description="Signals will appear here as you start completing tasks, asking questions, and shipping work."
          icon={Sparkles}
        />
      )}

      <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" /> About these signals
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
          Good signals celebrate wins (a task done quickly, fewer blockers). Attention signals flag
          something worth a small conversation. You can comment on any signal — private (only you),
          mentor-only, or shared — and ask your mentor to adjust the plan.
        </p>
      </div>

      <SignalDetailDrawer
        signal={drawerSignal}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        audience="newcomer"
        userId={newcomerId ?? null}
        mentorName={mentorName}
        newcomerName={newcomerName}
      />
    </div>
  );
}
