"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Filter } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SignalRow } from "@/components/ai/SignalRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

import { detectSignals, ignoreSignal, listSignals, resolveSignal } from "@/services/signals";
import { useDemo } from "@/providers/demo-provider";
import { toApiError } from "@/lib/api";

export default function SignalsCenterPage() {
  const qc = useQueryClient();
  const { newcomerId } = useDemo();
  const [filter, setFilter] = React.useState<"open" | "resolved" | "ignored" | "all">("open");

  const { data, isLoading } = useQuery({
    queryKey: ["signals", filter],
    queryFn: () => listSignals(filter === "all" ? undefined : { status: filter }),
  });

  const detectMut = useMutation({
    mutationFn: () => detectSignals(newcomerId!),
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
              disabled={!newcomerId || detectMut.isPending}
              onClick={() => detectMut.mutate()}
            >
              <Sparkles className="h-4 w-4" />
              {detectMut.isPending ? "Scanning…" : "Run detection"}
            </Button>
          </>
        }
      />

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
                onSchedule={() => toast.message("Schedule draft", { description: "Calendar integration is a next step." })}
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
                filter === "open" && newcomerId ? (
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
        <div className="mt-3">
          <Button asChild size="sm" variant="ghost">
            <Link href="/mentor">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
