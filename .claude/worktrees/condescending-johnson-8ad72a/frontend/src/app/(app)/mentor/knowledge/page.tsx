"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText, Sparkles, BookOpen, Plus, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

import { createDocument, getKnowledgeBase } from "@/services/documents";
import { toApiError } from "@/lib/api";

export default function KnowledgeBasePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["kb"],
    queryFn: getKnowledgeBase,
  });

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [domain, setDomain] = React.useState("engineering");
  const [docType, setDocType] = React.useState("guide");

  const createMut = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      toast.success("Document added to knowledge base");
      setTitle("");
      setContent("");
      qc.invalidateQueries({ queryKey: ["kb"] });
    },
    onError: (err) => toast.error("Couldn't add document", { description: toApiError(err).message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createMut.mutate({
      title: title.trim(),
      content: content.trim(),
      source: "manual_upload",
      document_type: docType,
      domain,
      role_target: "all",
      scope: "onboarding",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Knowledge base"
        title="Feed the AI with your company knowledge"
        description="Add handbooks, architecture docs, runbooks. The AI grounds plans and answers in what your team actually knows."
        actions={
          <Button asChild variant="ai">
            <Link href="/mentor/plan-generator">
              <Sparkles className="h-4 w-4" /> Generate plan
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-[color:var(--color-primary)]" /> Add a document
              </CardTitle>
              <CardDescription>
                Paste the content directly. We'll index it with embeddings for grounded AI answers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Deployment Guide"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Domain</Label>
                    <Select value={domain} onValueChange={setDomain}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="hr">HR & People</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="handbook">Handbook</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="runbook">Runbook</SelectItem>
                        <SelectItem value="checklist">Checklist</SelectItem>
                        <SelectItem value="reference">Reference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    rows={8}
                    placeholder="Paste the document content here…"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[color:var(--color-fg-subtle)]">
                    The AI will create embeddings automatically once it's ingested.
                  </p>
                  <Button type="submit" disabled={createMut.isPending}>
                    <Plus className="h-4 w-4" /> {createMut.isPending ? "Adding…" : "Add to knowledge base"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <section>
            <h2 className="mb-2 text-sm font-semibold tracking-tight">Added sources</h2>
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : !data || data.total === 0 ? (
              <EmptyState
                title="No sources yet"
                description="Drop in your company handbook, architecture overview, deployment guide or onboarding checklist."
              />
            ) : (
              <div className="space-y-5">
                {data.groups.map((group) => (
                  <div key={group.domain}>
                    <div className="mb-2 flex items-baseline gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                        {group.domain.replace(/_/g, " ")}
                      </h3>
                      <span className="text-xs text-[color:var(--color-fg-faint)]">{group.count} doc{group.count > 1 ? "s" : ""}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.documents.map((doc) => (
                        <article
                          key={doc.id}
                          className="surface-card p-4 hover:border-[color:var(--color-primary-ring)] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium tracking-tight text-[color:var(--color-fg)] truncate">{doc.title}</h4>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                <Badge tone="neutral" size="sm">{doc.document_type}</Badge>
                                <Badge tone="brand" size="sm">{doc.scope}</Badge>
                                <span className="text-[11px] text-[color:var(--color-fg-subtle)]">
                                  {doc.role_target === "all" ? "for everyone" : `for ${doc.role_target}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>

        <aside className="space-y-4">
          <AIInsightCard
            title="AI Knowledge Audit"
            description="Detected topics in your knowledge base and gaps the AI thinks you should fill."
            confidence={data ? 78 : undefined}
            tone="soft"
          >
            <div className="space-y-3">
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)] mb-1.5">
                  Detected topics
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(data?.detected_topics ?? [
                    "Company basics",
                    "HR / pointage",
                    "Payments architecture",
                    "Deployment",
                    "Code review",
                  ]).map((topic) => (
                    <Badge key={topic} tone="ai" size="sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </section>
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)] mb-1.5">
                  Missing context
                </div>
                <ul className="space-y-1.5">
                  {(data?.missing_topics ?? [
                    "Clear staging deployment explanation",
                    "Backend-specific first task guide",
                  ]).map((m) => (
                    <li
                      key={m}
                      className="rounded-lg border border-[color:var(--color-warning-soft)] bg-white px-3 py-2 text-sm text-[color:var(--color-fg)]"
                    >
                      <span className="mr-1.5 text-[color:var(--color-warning)]">●</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </AIInsightCard>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Suggested sources
              </div>
              <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                Common docs to seed for backend newcomers.
              </p>
              <ul className="mt-3 space-y-1.5">
                {[
                  "Company Handbook",
                  "Pointage Process",
                  "Payments Architecture",
                  "Deployment Guide",
                  "Code Review Checklist",
                  "Jira Workflow",
                  "Backend README",
                ].map((s) => (
                  <li
                    key={s}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-muted)]"
                  >
                    {s}
                    <ChevronRight className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
