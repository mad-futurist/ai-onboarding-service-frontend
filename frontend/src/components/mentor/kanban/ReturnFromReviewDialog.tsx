"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { KanbanTaskCard } from "@/services/mentor-kanban";
import { aiSuggestField } from "@/services/tasks";

interface Props {
  task: KanbanTaskCard | null;
  onCancel: () => void;
  onConfirm: (comment: string) => void;
  submitting?: boolean;
}

export function ReturnFromReviewDialog(props: Props) {
  // The parent conditionally mounts this component so every open is a fresh
  // instance — state initializes once on mount and resets on close.
  return <ReturnFromReviewDialogImpl {...props} />;
}

function ReturnFromReviewDialogImpl({
  task,
  onCancel,
  onConfirm,
  submitting,
}: Props) {
  const [comment, setComment] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const trimmed = comment.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  const handleAiDraft = async () => {
    if (!task) return;
    setAiLoading(true);
    setError(null);
    try {
      const response = await aiSuggestField(
        task.id,
        "acceptance_criteria",
        "Draft constructive review feedback explaining why this submission isn't ready yet and what the newcomer should improve. 2-3 short bullets.",
      );
      const raw = response.suggestion;
      const text =
        typeof raw === "string"
          ? raw
          : Array.isArray(raw)
            ? raw
                .map((line) =>
                  typeof line === "string" ? `- ${line}` : "",
                )
                .filter(Boolean)
                .join("\n")
            : "";
      if (text) setComment(text);
      else setError("AI returned an empty draft. Try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI draft failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => (!o ? onCancel() : null)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Return task for changes</DialogTitle>
          <DialogDescription>
            {task ? (
              <>
                You are sending <strong>{task.title}</strong> back to{" "}
                <em>In progress</em>. The newcomer will be notified with your
                comment.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="return-comment"
              className="text-sm font-medium text-[color:var(--color-fg)]"
            >
              What needs to change?
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAiDraft}
              disabled={aiLoading || submitting || !task}
              className="h-7 gap-1.5 text-xs"
            >
              {aiLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              AI draft
            </Button>
          </div>
          <Textarea
            id="return-comment"
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Be specific: what's missing, what to try, where to look."
            disabled={submitting}
          />
          {error ? (
            <p className="text-xs text-[color:var(--color-danger-fg)]">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(trimmed)}
            disabled={!canSubmit}
          >
            {submitting ? "Returning..." : "Return with comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
