"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Layers, ListChecks, Sparkles, Wand2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdjustPlanDialog } from "@/components/mentor/plan-generator/AdjustPlanDialog";
import { SignalAdjustmentFlow } from "@/components/mentor/plan-generator/SignalAdjustmentFlow";
import { cn } from "@/lib/utils";
import type { AISignal, ID } from "@/types";

interface AdjustEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signal: AISignal | null;
  planId: ID | null;
  newcomerId: ID | null;
  newcomerName?: string;
}

export function AdjustEntryDialog(props: AdjustEntryDialogProps) {
  if (!props.open) return null;
  return <AdjustEntryDialogInner {...props} />;
}

type Path = "chooser" | "rewrite" | "granular";

function AdjustEntryDialogInner({
  open,
  onOpenChange,
  signal,
  planId,
  newcomerId,
  newcomerName,
}: AdjustEntryDialogProps) {
  const [path, setPath] = React.useState<Path>("chooser");

  if (path === "rewrite") {
    return (
      <AdjustPlanDialog
        open={open}
        onOpenChange={(o) => {
          if (!o) onOpenChange(false);
        }}
        signal={signal}
        planId={planId}
        newcomerName={newcomerName}
      />
    );
  }

  if (path === "granular") {
    return (
      <SignalAdjustmentFlow
        open={open}
        onClose={() => onOpenChange(false)}
        signal={signal}
        newcomerId={newcomerId}
        newcomerName={newcomerName}
      />
    );
  }

  const recommendGranular = signal?.target_task_id != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg ai-gradient text-white shadow-[var(--shadow-ai)]">
              <Wand2 className="h-3.5 w-3.5" />
            </span>
            How should AI adjust the plan?
          </DialogTitle>
          <DialogDescription>
            {signal ? (
              <>
                Steering signal:{" "}
                <span className="font-medium text-[color:var(--color-fg)]">{signal.title}</span>.
              </>
            ) : (
              <>Choose how broadly the AI should reshape the plan.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            title="Propose targeted changes"
            description="AI proposes per-task changes you can accept, edit, or defer to a later period."
            icon={<ListChecks className="h-5 w-5" />}
            accent="ai"
            recommended={recommendGranular}
            onClick={() => setPath("granular")}
            dataDemoId="adjust-entry-granular"
          />
          <ChoiceCard
            title="Rewrite plan with notes"
            description="Quick steering notes, full plan rewrite. Best when the whole plan needs a rethink."
            icon={<Layers className="h-5 w-5" />}
            accent="warning"
            onClick={() => setPath("rewrite")}
            dataDemoId="adjust-entry-rewrite"
          />
        </div>

        <p className="text-[11px] text-[color:var(--color-fg-subtle)]">
          Done tasks are preserved in both paths. Targeted changes also let you protect specific
          manual edits and defer work to the next period.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ChoiceCard({
  title,
  description,
  icon,
  accent,
  recommended,
  onClick,
  dataDemoId,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: "ai" | "warning";
  recommended?: boolean;
  onClick: () => void;
  dataDemoId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-demo-id={dataDemoId}
      className={cn(
        "group relative rounded-2xl border border-[color:var(--color-border)] bg-white p-4 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-[color:var(--color-primary-ring)] hover:shadow-[var(--shadow-ai)]",
      )}
    >
      <div
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg text-white shadow-sm",
          accent === "ai" ? "ai-gradient" : "bg-[color:var(--color-warning)]",
        )}
      >
        {icon}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-[color:var(--color-fg)]">{title}</span>
        {recommended ? (
          <motion.span
            layoutId="adjust-entry-recommended"
            className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-primary-active)]"
          >
            <Sparkles className="h-3 w-3" /> Recommended
          </motion.span>
        ) : null}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">{description}</p>
    </button>
  );
}
