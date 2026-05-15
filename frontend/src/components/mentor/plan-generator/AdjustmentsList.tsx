"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Wand2, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { applyAdjustment, approveAdjustment } from "@/services/plan-adjustments";
import { toApiError } from "@/lib/api";
import type { PlanAdjustment, ID } from "@/types";

interface AdjustmentsListProps {
  planId: ID;
  adjustments: PlanAdjustment[];
}

export function AdjustmentsList({ planId, adjustments }: AdjustmentsListProps) {
  const qc = useQueryClient();

  const approveMut = useMutation({
    mutationFn: (id: ID) => approveAdjustment(id),
    onSuccess: () => {
      toast.success("Adjustment approved");
      qc.invalidateQueries({ queryKey: ["plan-adjustments", planId] });
    },
    onError: (err) => toast.error("Failed", { description: toApiError(err).message }),
  });
  const applyMut = useMutation({
    mutationFn: (id: ID) => applyAdjustment(id),
    onSuccess: () => {
      toast.success("Adjustment applied");
      qc.invalidateQueries({ queryKey: ["plan-adjustments", planId] });
      qc.invalidateQueries({ queryKey: ["plan", planId] });
    },
    onError: (err) => toast.error("Failed", { description: toApiError(err).message }),
  });

  if (!adjustments.length) {
    return (
      <EmptyState
        icon={Wand2}
        title="No AI adjustments yet"
        description="When the AI spots a gap or an improvement to the plan, it'll appear here for your review."
      />
    );
  }

  return (
    <div className="space-y-3">
      {adjustments.map((adj) => (
        <Card key={adj.id}>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
                  {adj.title ?? `Adjustment #${adj.id}`}
                </h3>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[color:var(--color-fg-subtle)]">
                  <Badge tone={statusTone(adj.status)} size="sm">
                    {adj.status}
                  </Badge>
                  <span>{new Date(adj.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {adj.status === "draft" || adj.status === "pending" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveMut.mutate(adj.id)}
                    disabled={approveMut.isPending}
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                ) : null}
                {adj.status === "approved" ? (
                  <Button
                    size="sm"
                    variant="ai"
                    onClick={() => applyMut.mutate(adj.id)}
                    disabled={applyMut.isPending}
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Apply changes
                  </Button>
                ) : null}
              </div>
            </div>
            {adj.strengths?.length ? (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-success-fg)] mb-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Strengths
                </div>
                <ul className="space-y-0.5 text-sm">
                  {adj.strengths.map((s, i) => (
                    <li key={i} className="text-[color:var(--color-fg)]">· {s}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {adj.gaps?.length ? (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-warning-fg)] mb-1.5 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Gaps
                </div>
                <ul className="space-y-0.5 text-sm">
                  {adj.gaps.map((g, i) => (
                    <li key={i} className="text-[color:var(--color-fg)]">· {g}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {adj.changes?.length ? (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)] mb-1.5">
                  Proposed changes
                </div>
                <ul className="space-y-1 text-sm">
                  {adj.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChangeIcon type={c.type} />
                      <span className="text-[color:var(--color-fg)]">{c.description}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChangeIcon({ type }: { type: "add" | "remove" | "shift" }) {
  if (type === "add")
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)] text-xs">
        +
      </span>
    );
  if (type === "remove")
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)] text-xs">
        −
      </span>
    );
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-[color:var(--color-info-soft)] text-[color:var(--color-info-fg)]">
      <ArrowRight className="h-3 w-3" />
    </span>
  );
}

function statusTone(status: string): "neutral" | "success" | "warning" | "danger" | "info" | "ai" | "brand" {
  switch (status) {
    case "approved":
      return "success";
    case "declined":
      return "danger";
    case "pending":
    case "draft":
      return "warning";
    default:
      return "neutral";
  }
}
