"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { PlanBreadcrumb } from "@/components/mentor/plan-generator/PlanBreadcrumb";
import { WorkspaceTabs } from "@/components/mentor/plan-generator/WorkspaceTabs";

import { getPlan } from "@/services/plans";
import type { ID } from "@/types";

export default function PlanWorkspacePage() {
  const params = useParams<{ planId: string }>();
  const planId = Number(params.planId);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId),
    enabled: Number.isFinite(planId),
  });

  const [selectedDocs, setSelectedDocs] = React.useState<Set<ID>>(new Set());

  if (isLoading || !plan) {
    return (
      <>
        <PlanBreadcrumb
          crumbs={[
            { label: "Plan generator", href: "/mentor/plan-generator" },
            { label: "Loading…" },
          ]}
        />
        <Skeleton className="h-96" />
      </>
    );
  }

  return (
    <>
      <PlanBreadcrumb
        crumbs={[
          { label: "Plan generator", href: "/mentor/plan-generator" },
          { label: plan.title, href: `/mentor/plan-generator/${plan.id}` },
          { label: "Workspace", href: `/mentor/plan-generator/${plan.id}/workspace` },
        ]}
      />
      <WorkspaceTabs
        plan={plan}
        selectedDocs={selectedDocs}
        onToggleDoc={(id) =>
          setSelectedDocs((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onSelectAllDocs={(ids) => setSelectedDocs(new Set(ids))}
      />
    </>
  );
}
