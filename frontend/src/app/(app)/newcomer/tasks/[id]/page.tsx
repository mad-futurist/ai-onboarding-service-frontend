"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { BlockedTrigger } from "@/components/newcomer/BlockedDialog";

import { getTaskDetail, updateTaskStatus } from "@/services/tasks";
import { toApiError } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import type { TaskExample, TaskLink } from "@/types";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["task-detail", id],
    queryFn: () => getTaskDetail(id),
    enabled: Number.isFinite(id),
  });

  const completeMut = useMutation({
    mutationFn: () => updateTaskStatus(id, "done"),
    onSuccess: () => {
      toast.success("Task completed", { description: "Nice - pace your wins." });
      qc.invalidateQueries({ queryKey: ["task-detail", id] });
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
    },
    onError: (err) => toast.error("Couldn't update", { description: toApiError(err).message }),
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-44" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const task = data.task;
  const done = task.status === "done";
  const acceptanceItems = splitCriteria(task.acceptance_criteria);
  const successItems = splitCriteria(task.success_criteria);
  const examples = task.examples ?? [];
  const links = task.links ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusBadge status={task.status} />
          {task.priority ? <PriorityBadge priority={task.priority} /> : null}
        </div>
      </div>

      <PageHeader
        eyebrow={task.week_number ? `Week ${task.week_number}` : "Task"}
        title={task.title}
        description={taskSubtitle(task)}
        actions={
          <>
            <BlockedTrigger taskId={task.id} />
            <Button asChild variant="outline">
              <Link href={`/newcomer/ask?q=${encodeURIComponent(task.title)}`}>
                <Sparkles className="h-4 w-4" /> Ask AI
              </Link>
            </Button>
            <Button
              variant={done ? "secondary" : "ai"}
              disabled={done || completeMut.isPending}
              onClick={() => completeMut.mutate()}
            >
              {done ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Done
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> {completeMut.isPending ? "Marking..." : "Mark as done"}
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[color:var(--color-primary)]" /> Description
            </CardTitle>
            <CardDescription>What this task is asking you to do.</CardDescription>
          </CardHeader>
          <CardContent>
            {task.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-fg)]">
                {task.description}
              </p>
            ) : (
              <EmptyInline>No description yet.</EmptyInline>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[color:var(--color-primary)]" /> Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <MetaRow label="Week" value={task.week_number ?? "-"} />
            <MetaRow label="Day" value={task.day_number ?? "-"} />
            <MetaRow label="Type" value={task.task_type || "-"} />
            <MetaRow label="Priority" value={task.priority || "-"} />
          </CardContent>
        </Card>
      </div>

      {data.why_it_matters ? (
        <AIInsightCard title="Why this matters" tone="soft" description={data.why_it_matters} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <CriteriaCard
          icon={ClipboardCheck}
          title="Acceptance criteria"
          description="The concrete conditions that make this task accepted."
          items={acceptanceItems}
          empty="No acceptance criteria yet."
        />
        <CriteriaCard
          icon={Target}
          title="Success criteria"
          description="The outcome your mentor will look for."
          items={successItems}
          empty="No success criteria yet."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ExamplesCard examples={examples} />
        <LinksCard links={links} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Related sources
            </CardTitle>
            <CardDescription>From your team knowledge base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.related_documents?.length ? (
              data.related_documents.map((d) => (
                <article
                  key={d.id}
                  className="flex items-start gap-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">{d.title}</div>
                    <div className="text-xs text-[color:var(--color-fg-muted)]">{d.domain}</div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyInline>No related sources surfaced yet.</EmptyInline>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[color:var(--color-primary)]" /> People who can help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.people_to_ask?.length ? (
              data.people_to_ask.map((p, i) => {
                const name = p.name ?? p.full_name ?? "Unknown teammate";
                const role = p.role ?? p.team;

                return (
                  <div key={`${name}-${i}`} className="flex items-center gap-3 rounded-lg px-1 py-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">{name}</div>
                      {role ? <div className="truncate text-xs text-[color:var(--color-fg-muted)]">{role}</div> : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyInline>No people suggested yet.</EmptyInline>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CriteriaCard({
  icon: Icon,
  title,
  description,
  items,
  empty,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  items: string[];
  empty: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[color:var(--color-primary)]" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-relaxed text-[color:var(--color-fg)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-success-fg)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyInline>{empty}</EmptyInline>
        )}
      </CardContent>
    </Card>
  );
}

function ExamplesCard({ examples }: { examples: TaskExample[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Examples
        </CardTitle>
        <CardDescription>Concrete examples or references for the task.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {examples.length ? (
          examples.map((example, index) => (
            <article key={`${example.title}-${index}`} className="rounded-lg border border-[color:var(--color-border)] bg-white p-3">
              <div className="text-sm font-semibold text-[color:var(--color-fg)]">
                {example.title || `Example ${index + 1}`}
              </div>
              {example.content ? (
                <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{example.content}</p>
              ) : null}
            </article>
          ))
        ) : (
          <EmptyInline>No examples yet.</EmptyInline>
        )}
      </CardContent>
    </Card>
  );
}

function LinksCard({ links }: { links: TaskLink[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-[color:var(--color-primary)]" /> Links
        </CardTitle>
        <CardDescription>Helpful material for this task.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {links.length ? (
          links.map((item, index) => (
            <a
              key={`${item.url}-${index}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm text-[color:var(--color-fg)] transition hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-surface-muted)]/40"
            >
              <span className="truncate">{item.label || item.url}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-faint)]" />
            </a>
          ))
        ) : (
          <EmptyInline>No links yet.</EmptyInline>
        )}
      </CardContent>
    </Card>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[color:var(--color-surface-muted)] px-3 py-2 text-sm">
      <span className="text-[color:var(--color-fg-subtle)]">{label}</span>
      <span className="truncate font-medium text-[color:var(--color-fg)]">{value}</span>
    </div>
  );
}

function EmptyInline({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--color-border)] px-4 py-5 text-center text-sm text-[color:var(--color-fg-muted)]">
      {children}
    </div>
  );
}

function splitCriteria(value?: string | null) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function taskSubtitle(task: { week_number: number | null; day_number: number | null; task_type: string }) {
  const parts = [];
  if (task.week_number) parts.push(`Week ${task.week_number}`);
  if (task.day_number) parts.push(`Day ${task.day_number}`);
  if (task.task_type) parts.push(task.task_type);
  return parts.length ? parts.join(" - ") : "Onboarding task";
}
