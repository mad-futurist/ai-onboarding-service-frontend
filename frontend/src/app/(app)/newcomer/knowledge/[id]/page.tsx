"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, MessageSquareText, Network } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemo } from "@/providers/demo-provider";
import { getNewcomerDocument } from "@/services/newcomer-kb";
import { DocumentPreviewPremium } from "@/components/newcomer/knowledge/DocumentPreviewPremium";
import { DocumentChatPanel } from "@/components/newcomer/knowledge/DocumentChatPanel";
import { DocumentMindMap } from "@/components/newcomer/knowledge/DocumentMindMap";
import { PriorConversations } from "@/components/newcomer/ask/PriorConversations";

export default function NewcomerKnowledgeDetailPage() {
  const params = useParams<{ id: string }>();
  const docId = Number(params?.id);
  const { newcomerId } = useDemo();

  const { data, isLoading, error } = useQuery({
    queryKey: ["newcomer-kb", "document", newcomerId, docId],
    queryFn: () => getNewcomerDocument(newcomerId!, docId),
    enabled: !!newcomerId && Number.isFinite(docId),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/newcomer/knowledge">
            <ArrowLeft className="h-4 w-4" /> Back to knowledge
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/5" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl ai-gradient-soft">
            <BookOpen className="h-5 w-5 text-[color:var(--color-primary)]" />
          </div>
          <h2 className="mt-3 text-sm font-semibold">Document not found</h2>
          <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
            It may have been removed or you don&apos;t have access.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="preview">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Preview
            </TabsTrigger>
            <TabsTrigger value="ask">
              <MessageSquareText className="h-3.5 w-3.5 mr-1.5" /> Ask
            </TabsTrigger>
            <TabsTrigger value="mindmap">
              <Network className="h-3.5 w-3.5 mr-1.5" /> Mind map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            <DocumentPreviewPremium doc={data} />
          </TabsContent>

          <TabsContent value="ask">
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <DocumentChatPanel doc={data} />
              <aside className="hidden lg:block space-y-3">
                <div className="ai-border rounded-2xl">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
                      About this doc
                    </div>
                    <div className="mt-1 text-sm font-medium">{data.title}</div>
                    <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                      {data.domain ? <span className="capitalize">{data.domain}</span> : null}
                      {data.scope ? <span> · {data.scope}</span> : null}
                    </div>
                  </div>
                </div>
                <PriorConversations contextType="document" contextId={data.id} />
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="mindmap">
            <DocumentMindMap documentId={data.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
