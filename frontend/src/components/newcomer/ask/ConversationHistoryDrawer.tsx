"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, ListChecks, MessageSquarePlus, MessageSquareText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { deleteConversation } from "@/services/ai";
import { toApiError } from "@/lib/api";
import type { AIConversation, ID } from "@/types";

interface ConversationHistoryDrawerProps {
  conversations: AIConversation[] | undefined;
  isLoading: boolean;
  activeConversationId: ID | null;
  onSelect: (id: ID) => void;
  onNew: () => void;
  newcomerId: ID | null;
}

type Bucket = "today" | "yesterday" | "older";

function bucketOf(iso: string): Bucket {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  return "older";
}

const BUCKET_LABEL: Record<Bucket, string> = {
  today: "Today",
  yesterday: "Yesterday",
  older: "Older",
};

export function ConversationHistoryDrawer({
  conversations,
  isLoading,
  activeConversationId,
  onSelect,
  onNew,
  newcomerId,
}: ConversationHistoryDrawerProps) {
  const qc = useQueryClient();

  const deleteMut = useMutation({
    mutationFn: (id: ID) => deleteConversation(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["ai", "conversations", newcomerId] });
      qc.removeQueries({ queryKey: ["ai", "conversation", id] });
      if (id === activeConversationId) onNew();
      toast.success("Conversation deleted");
    },
    onError: (err) => toast.error("Couldn't delete", { description: toApiError(err).message }),
  });

  const grouped = React.useMemo(() => {
    const buckets: Record<Bucket, AIConversation[]> = { today: [], yesterday: [], older: [] };
    for (const c of conversations ?? []) {
      buckets[bucketOf(c.updated_at)].push(c);
    }
    return buckets;
  }, [conversations]);

  return (
    <div className="flex h-full w-full flex-col gap-3 p-3">
      <Button variant="ai" size="sm" className="w-full" onClick={onNew}>
        <MessageSquarePlus className="h-3.5 w-3.5" />
        New chat
      </Button>

      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-3/4" />
          </div>
        ) : !conversations?.length ? (
          <div className="rounded-lg border border-dashed border-[color:var(--color-border)] p-4 text-center text-xs text-[color:var(--color-fg-muted)]">
            No conversations yet. Ask something to start one.
          </div>
        ) : (
          <div className="space-y-4">
            {(Object.keys(grouped) as Bucket[]).map((bucket) =>
              grouped[bucket].length ? (
                <div key={bucket} className="space-y-1">
                  <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    {BUCKET_LABEL[bucket]}
                  </div>
                  {grouped[bucket].map((c) => (
                    <ConversationRow
                      key={c.id}
                      conversation={c}
                      active={activeConversationId === c.id}
                      onSelect={() => onSelect(c.id)}
                      onDelete={() => {
                        if (window.confirm("Delete this conversation?")) deleteMut.mutate(c.id);
                      }}
                      deleting={deleteMut.isPending && deleteMut.variables === c.id}
                    />
                  ))}
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConversationRowProps {
  conversation: AIConversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  deleting: boolean;
}

function ConversationRow({ conversation, active, onSelect, onDelete, deleting }: ConversationRowProps) {
  const ContextIcon =
    conversation.context_type === "document"
      ? BookOpen
      : conversation.context_type === "task"
        ? ListChecks
        : MessageSquareText;

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
          : "hover:bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg)]",
      )}
    >
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <ContextIcon className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-faint)]" />
        <span className="truncate">{conversation.title}</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="opacity-0 transition-opacity group-hover:opacity-100 text-[color:var(--color-fg-faint)] hover:text-[color:var(--color-danger)]"
        aria-label="Delete conversation"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
