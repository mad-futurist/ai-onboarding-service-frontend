"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Sparkles,
  BookOpen,
  Users,
  Target,
  CheckCircle2,
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
      toast.success("Task completed", { description: "Nice — pace your wins." });
      qc.invalidateQueries({ queryKey: ["task-detail", id] });
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
    },
    onError: (err) => toast.error("Couldn't update", { description: toApiError(err).message }),
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const task = data.task;
  const done = task.status === "done";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {task.priority ? <PriorityBadge priority={task.priority} /> : null}
        </div>
      </div>

      <PageHeader
        eyebrow={task.week_number ? `Week ${task.week_number}` : "Task"}
        title={task.title}
        description={task.description}
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
                  <Check className="h-4 w-4" /> {completeMut.isPending ? "Marking…" : "Mark as done"}
                </>
              )}
            </Button>
          </>
        }
      />

      {data.why_it_matters ? (
        <AIInsightCard title="Why this matters" tone="soft" description={data.why_it_matters} />
      ) : null}

      {task.success_criteria ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[color:var(--color-primary)]" /> Success criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line text-[color:var(--color-fg)]">{task.success_criteria}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Related sources
            </CardTitle>
            <CardDescription>From your team's knowledge base.</CardDescription>
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
                    <div className="text-sm font-medium text-[color:var(--color-fg)] truncate">{d.title}</div>
                    <div className="text-xs text-[color:var(--color-fg-muted)]">{d.domain}</div>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-xs text-[color:var(--color-fg-muted)]">No related sources surfaced yet.</p>
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
                  <div key={`${name}-${i}`} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[color:var(--color-fg)] truncate">{name}</div>
                      {role ? <div className="text-xs text-[color:var(--color-fg-muted)] truncate">{role}</div> : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[color:var(--color-fg-muted)]">AI will recommend people once you have more context.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
