"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, History } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { listConversations } from "@/services/ai";
import { useDemo } from "@/providers/demo-provider";
import type { AIConversationContextType, ID } from "@/types";

interface PriorConversationsProps {
  contextType: AIConversationContextType;
  contextId: ID;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PriorConversations({ contextType, contextId }: PriorConversationsProps) {
  const { newcomerId } = useDemo();

  const query = useQuery({
    queryKey: ["ai", "conversations", newcomerId, contextType, contextId],
    queryFn: () =>
      listConversations({
        newcomer_id: newcomerId ?? undefined,
        context_type: contextType,
        context_id: contextId,
      }),
    enabled: !!newcomerId,
  });

  if (query.isLoading) {
    return (
      <div className="space-y-2 rounded-2xl border border-[color:var(--color-border)] bg-white p-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (!query.data?.length) return null;

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        <History className="h-3 w-3" /> Past conversations
      </div>
      <div className="space-y-1">
        {query.data.map((c) => (
          <Link
            key={c.id}
            href={`/newcomer/ask?conversationId=${c.id}`}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[color:var(--color-surface-muted)]"
          >
            <span className="min-w-0 flex-1 truncate text-[color:var(--color-fg)]">{c.title}</span>
            <span className="shrink-0 text-[11px] text-[color:var(--color-fg-subtle)]">
              {formatWhen(c.updated_at)}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
