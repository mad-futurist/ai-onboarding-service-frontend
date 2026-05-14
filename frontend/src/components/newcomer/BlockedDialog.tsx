"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertOctagon, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createBlockedReport } from "@/services/blocked";
import { useDemo } from "@/providers/demo-provider";
import { toApiError } from "@/lib/api";
import type { ID } from "@/types";

const CATEGORIES = [
  { value: "documentation_unclear", label: "I do not understand the documentation" },
  { value: "access_issue", label: "I cannot access a tool" },
  { value: "dont_know_who_to_ask", label: "I do not know who to ask" },
  { value: "task_unclear", label: "I do not understand the task" },
  { value: "afraid_to_ask", label: "I am afraid to ask a basic question" },
  { value: "other", label: "Other" },
];

export function BlockedDialog({
  open,
  onOpenChange,
  triggerLabel,
  taskId,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  taskId?: ID;
}) {
  const { newcomerId } = useDemo();
  const qc = useQueryClient();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const [category, setCategory] = React.useState<string>("documentation_unclear");
  const [details, setDetails] = React.useState("");

  const mut = useMutation({
    mutationFn: () =>
      createBlockedReport({
        newcomer_id: newcomerId!,
        task_id: taskId,
        blocker_type: category,
        details: details || undefined,
      }),
    onSuccess: () => {
      toast.success("Sent — your mentor will see this", {
        description: "AI also suggested next steps below.",
      });
      setOpen(false);
      setDetails("");
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      if (taskId) {
        qc.invalidateQueries({ queryKey: ["task-detail", taskId] });
      }
    },
    onError: (err) => toast.error("Couldn't send", { description: toApiError(err).message }),
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-[color:var(--color-warning)]" />
            I'm blocked
          </DialogTitle>
          <DialogDescription>
            Tell us what's stopping you. No question is too basic — this is a normal part of onboarding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>What kind of block?</Label>
            <div className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <label
                  key={c.value}
                  className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-[color:var(--color-surface-muted)] cursor-pointer"
                >
                  <Checkbox
                    checked={category === c.value}
                    onCheckedChange={() => setCategory(c.value)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-[color:var(--color-fg)]">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="details">Optional details</Label>
            <Textarea
              id="details"
              rows={3}
              placeholder="What did you try? What still doesn't make sense?"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-[color:var(--color-primary-ring)] ai-gradient-soft p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
              <Sparkles className="h-3 w-3" /> AI suggestion
            </div>
            <p className="mt-1 text-sm text-[color:var(--color-fg)]">
              This sounds related to deployment. Try asking Victor on #deploys, or open the short deployment checklist.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="ai" disabled={mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? "Sending…" : "Send to mentor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BlockedTrigger({ children, taskId }: { children?: React.ReactNode; taskId?: ID }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {children ?? (
          <>
            <AlertOctagon className="h-4 w-4 text-[color:var(--color-warning)]" /> I'm blocked
          </>
        )}
      </Button>
      <BlockedDialog open={open} onOpenChange={setOpen} taskId={taskId} />
    </>
  );
}
