"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { Markdown } from "@/components/shared/Markdown";
import { PriorityBadge, SeverityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { askAI } from "@/services/ai";
import { listBlockedForNewcomer } from "@/services/blocked";
import {
  createTaskComment,
  listTaskComments,
  type TaskComment,
} from "@/services/task-comments";
import { getTaskDetail, updateTaskStatus } from "@/services/tasks";
import { toApiError } from "@/lib/api";
import { humanizeSignalType } from "@/lib/constants";
import { fmtRelative } from "@/lib/format";
import { cn, getInitials } from "@/lib/utils";
import type {
  BlockedReport,
  ID,
  OnboardingTask,
  TaskDetailResponse,
} from "@/types";
import type { KanbanTaskCard } from "@/services/mentor-kanban";

interface MentorTaskDetailSheetProps {
  open: boolean;
  card: KanbanTaskCard | null;
  mentorId: ID | null;
  onOpenChange: (open: boolean) => void;
}

export function MentorTaskDetailSheet({
  open,
  card,
  mentorId,
  onOpenChange,
}: MentorTaskDetailSheetProps) {
  const qc = useQueryClient();
  const taskId = card?.id;

  const detailQuery = useQuery({
    queryKey: ["task-detail", taskId],
    queryFn: () => getTaskDetail(taskId!),
    enabled: open && taskId != null,
  });

  const commentsQuery = useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => listTaskComments(taskId!),
    enabled: open && taskId != null,
  });

  const blockedQuery = useQuery({
    queryKey: ["blocked-reports", "newcomer", card?.newcomer.id],
    queryFn: () => listBlockedForNewcomer(card!.newcomer.id),
    enabled: open && card?.newcomer.id != null,
  });

  const [reply, setReply] = React.useState("");
  const [aiAnswer, setAiAnswer] = React.useState<string | null>(null);

  const commentMut = useMutation({
    mutationFn: (body: string) =>
      createTaskComment(taskId!, body, {
        commentType: "general",
        authorUserId: mentorId,
      }),
    onSuccess: () => {
      toast.success("Comment sent");
      setReply("");
      qc.invalidateQueries({ queryKey: ["task-comments", taskId] });
      qc.invalidateQueries({ queryKey: ["mentor-kanban"] });
    },
    onError: (err) =>
      toast.error("Could not send comment", {
        description: toApiError(err).message,
      }),
  });

  const statusMut = useMutation({
    mutationFn: (vars: {
      status: OnboardingTask["status"];
      comment?: string;
    }) =>
      updateTaskStatus(taskId!, vars.status, {
        comment: vars.comment,
        actorUserId: mentorId,
      }),
    onSuccess: (_, vars) => {
      toast.success(vars.status === "done" ? "Task approved" : "Task updated");
      if (vars.comment) setReply("");
      qc.invalidateQueries({ queryKey: ["task-detail", taskId] });
      qc.invalidateQueries({ queryKey: ["task-comments", taskId] });
      qc.invalidateQueries({ queryKey: ["mentor-kanban"] });
    },
    onError: (err) =>
      toast.error("Could not update task", {
        description: toApiError(err).message,
      }),
  });

  const aiMut = useMutation({
    mutationFn: async () => {
      if (!card || !detailQuery.data) {
        throw new Error("Task context is not ready yet.");
      }
      return askAI({
        newcomer_id: card.newcomer.id,
        context_type: "task",
        context_id: card.id,
        top_k: 5,
        question: buildMentorAnalysisPrompt({
          card,
          detail: detailQuery.data,
          comments: commentsQuery.data ?? [],
          blockedReports: taskBlockedReports(blockedQuery.data, card.id),
        }),
      });
    },
    onSuccess: (response) => {
      setAiAnswer(response.answer);
    },
    onError: (err) =>
      toast.error("AI analysis failed", {
        description: toApiError(err).message,
      }),
  });

  if (!card) return null;

  const detail = detailQuery.data;
  const comments = [...(commentsQuery.data ?? [])].reverse();
  const blockedReports = taskBlockedReports(blockedQuery.data, card.id);
  const currentStatus = detail?.task.status ?? card.status;
  const latestQuestion = detail?.related_ai_questions?.[0] ?? null;
  const acceptanceItems = splitCriteria(detail?.task.acceptance_criteria);
  const latestReviewReturn =
    comments.findLast?.((item) => item.comment_type === "review_return") ??
    [...comments].reverse().find((item) => item.comment_type === "review_return") ??
    null;

  const localAnalysis = buildLocalAnalysis({
    card,
    detail,
    comments,
    blockedReports,
  });

  const sendDisabled = !reply.trim() || commentMut.isPending || statusMut.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-none flex-col overflow-hidden p-0 sm:w-[760px] sm:max-w-[760px]">
        <div className="relative border-b border-[color:var(--color-border)] bg-white px-5 py-5">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 ai-gradient" />
          <SheetHeader className="pr-8">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={currentStatus} size="sm" />
              <PriorityBadge priority={card.priority} size="sm" />
              {card.latest_signal ? (
                <SeverityBadge severity={card.latest_signal.severity} size="sm" />
              ) : null}
            </div>
            <SheetTitle className="text-xl leading-tight">
              {detail?.task.title ?? card.title}
            </SheetTitle>
            <SheetDescription>
              {card.newcomer.full_name}
              {card.newcomer.job_title ? ` - ${card.newcomer.job_title}` : ""}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <MiniMetric
              label="Days in lane"
              value={`${card.days_in_status}d`}
              icon={Clock}
            />
            <MiniMetric
              label="Urgency"
              value={String(card.urgency_score)}
              icon={AlertTriangle}
              tone={card.urgency_score >= 10 ? "danger" : "warning"}
            />
            <MiniMetric
              label="Returns"
              value={`${card.review_return_count}x`}
              icon={RotateCcw}
              tone={card.review_return_count ? "danger" : "neutral"}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[color:var(--color-bg)] px-5 py-5">
          {detailQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 rounded-[14px]" />
              <Skeleton className="h-48 rounded-[14px]" />
              <Skeleton className="h-40 rounded-[14px]" />
            </div>
          ) : (
            <div className="space-y-4">
              <AIInsightCard
                title="Mentor task analysis"
                description="AI-ready summary of where the newcomer stands and what needs attention."
                actions={
                  <Button
                    type="button"
                    size="sm"
                    variant="ai"
                    onClick={() => aiMut.mutate()}
                    disabled={aiMut.isPending}
                  >
                    {aiMut.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                    Analyze
                  </Button>
                }
              >
                {aiAnswer ? (
                  <Markdown>{aiAnswer}</Markdown>
                ) : (
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    {localAnalysis.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[12px] border border-white/70 bg-white/80 p-3"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
                          {item.label}
                        </div>
                        <p className="mt-1 leading-relaxed text-[color:var(--color-fg-muted)]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </AIInsightCard>

              <section className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)]">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[color:var(--color-fg)]">
                      Blocker diagnosis
                    </h3>
                    <p className="text-xs text-[color:var(--color-fg-muted)]">
                      Why the person may be stuck and what evidence we have.
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {blockedReports.length ? (
                    blockedReports.map((report) => (
                      <BlockedReportRow key={report.id} report={report} />
                    ))
                  ) : card.latest_signal ? (
                    <SignalBlock signal={card.latest_signal} />
                  ) : latestReviewReturn ? (
                    <InfoRow
                      icon={MessageSquare}
                      title="Latest review feedback"
                      body={latestReviewReturn.body}
                    />
                  ) : (
                    <InfoRow
                      icon={CheckCircle2}
                      title="No explicit blocker report"
                      body="No open blocked report is attached to this task. Check the activity and comments for softer friction signals."
                      tone="success"
                    />
                  )}
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[color:var(--color-primary)]" />
                    <h3 className="text-sm font-semibold">Task context</h3>
                  </div>
                  {detail?.task.description ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                      {detail.task.description}
                    </p>
                  ) : (
                    <EmptyInline>No task description yet.</EmptyInline>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                      <Target className="h-3.5 w-3.5" />
                      Acceptance criteria
                    </div>
                    {acceptanceItems.length ? (
                      <ul className="mt-2 space-y-2">
                        {acceptanceItems.map((item, index) => (
                          <li
                            key={`${item}-${index}`}
                            className="flex gap-2 text-sm text-[color:var(--color-fg)]"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-success-fg)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyInline>No acceptance criteria.</EmptyInline>
                    )}
                  </div>
                </div>

                <div className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-[color:var(--color-primary)]" />
                    <h3 className="text-sm font-semibold">Newcomer activity</h3>
                  </div>
                  <div className="mt-3 space-y-2">
                    <ActivityItem
                      title="Current lane"
                      body={`${currentStatus.replaceAll("_", " ")} for ${card.days_in_status} day${card.days_in_status === 1 ? "" : "s"}`}
                    />
                    {latestQuestion ? (
                      <ActivityItem
                        title="Latest AI question"
                        body={latestQuestion.question}
                      />
                    ) : null}
                    {comments.length ? (
                      <ActivityItem
                        title="Comments"
                        body={`${comments.length} message${comments.length === 1 ? "" : "s"} in the task thread`}
                      />
                    ) : null}
                    {!latestQuestion && !comments.length ? (
                      <EmptyInline>No visible activity yet.</EmptyInline>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-[14px] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]">
                <div className="border-b border-[color:var(--color-border)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[color:var(--color-primary)]" />
                      <h3 className="text-sm font-semibold">Task chat</h3>
                    </div>
                    <span className="text-xs tabular-nums text-[color:var(--color-fg-muted)]">
                      {comments.length} message{comments.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div className="max-h-[320px] space-y-3 overflow-y-auto p-4">
                  {comments.length ? (
                    comments.map((comment) => (
                      <CommentBubble
                        key={comment.id}
                        comment={comment}
                        mentorId={mentorId}
                        newcomerName={card.newcomer.full_name}
                      />
                    ))
                  ) : (
                    <EmptyInline>
                      No messages yet. Send a clear next step or ask what is still blocking them.
                    </EmptyInline>
                  )}
                </div>

                <div className="border-t border-[color:var(--color-border)] p-4">
                  <Textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Reply to the newcomer, ask for evidence, or explain what to fix..."
                    className="min-h-[96px] rounded-[12px]"
                  />
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-[color:var(--color-fg-muted)]">
                      Comments stay attached to this task and are visible in the task thread.
                    </p>
                    <div className="flex flex-wrap justify-end gap-2">
                      {currentStatus === "in_review" ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={sendDisabled}
                            onClick={() =>
                              statusMut.mutate({
                                status: "in_progress",
                                comment: reply.trim(),
                              })
                            }
                          >
                            {statusMut.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                            Return with feedback
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            disabled={statusMut.isPending}
                            onClick={() => statusMut.mutate({ status: "done" })}
                          >
                            {statusMut.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </Button>
                        </>
                      ) : null}
                      <Button
                        type="button"
                        variant="ai"
                        size="sm"
                        disabled={sendDisabled}
                        onClick={() => commentMut.mutate(reply.trim())}
                      >
                        {commentMut.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Send comment
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

type MiniMetricTone = "neutral" | "warning" | "danger";

function MiniMetric({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone?: MiniMetricTone;
}) {
  const toneClass: Record<MiniMetricTone, string> = {
    neutral:
      "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
    warning:
      "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)]",
    danger:
      "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)]",
  };

  return (
    <div className="rounded-[12px] border border-[color:var(--color-border)] bg-white/80 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            {label}
          </div>
          <div className="mt-1 text-lg font-semibold text-[color:var(--color-fg)]">
            {value}
          </div>
        </div>
        <span className={cn("grid h-8 w-8 place-items-center rounded-[10px]", toneClass[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function BlockedReportRow({ report }: { report: BlockedReport }) {
  return (
    <InfoRow
      icon={AlertTriangle}
      title={humanizeBlocker(report.blocker_type)}
      body={report.details || report.ai_suggestion || "No details were provided."}
      meta={`Reported ${fmtRelative(report.created_at)}`}
      tone="danger"
    />
  );
}

function SignalBlock({ signal }: { signal: NonNullable<KanbanTaskCard["latest_signal"]> }) {
  return (
    <InfoRow
      icon={Sparkles}
      title={humanizeSignalType(signal.signal_type)}
      body={signal.title}
      meta={`Severity: ${signal.severity}`}
      tone="warning"
    />
  );
}

function InfoRow({
  icon: Icon,
  title,
  body,
  meta,
  tone = "neutral",
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  meta?: string;
  tone?: "neutral" | "warning" | "danger" | "success";
}) {
  const toneClass = {
    neutral:
      "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
    warning:
      "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)]",
    danger:
      "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)]",
    success:
      "bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]",
  }[tone];

  return (
    <div className="flex gap-3 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 p-3">
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px]", toneClass)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[color:var(--color-fg)]">
          {title}
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
          {body}
        </p>
        {meta ? (
          <div className="mt-1 text-[11px] text-[color:var(--color-fg-subtle)]">
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActivityItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        {title}
      </div>
      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[color:var(--color-fg)]">
        {body}
      </p>
    </div>
  );
}

function CommentBubble({
  comment,
  mentorId,
  newcomerName,
}: {
  comment: TaskComment;
  mentorId: ID | null;
  newcomerName: string;
}) {
  const fromMentor =
    comment.author_user_id != null && mentorId != null
      ? comment.author_user_id === mentorId
      : comment.comment_type === "review_return";
  const fromSystem = comment.comment_type === "status_change" || comment.comment_type === "system";
  const label = fromSystem ? "System" : fromMentor ? "Mentor" : newcomerName;
  const initials = fromSystem ? "AI" : getInitials(label);

  return (
    <div className={cn("flex gap-2", fromMentor && "justify-end")}>
      {!fromMentor ? (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-surface-muted)] text-[10px] font-semibold text-[color:var(--color-fg-muted)]">
          {initials}
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[85%] rounded-[14px] border px-3 py-2",
          fromMentor
            ? "border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)]"
            : "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          <span>{label}</span>
          <span>{fmtRelative(comment.created_at)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

function EmptyInline({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-[12px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 px-4 py-5 text-center text-sm text-[color:var(--color-fg-muted)]">
      {children}
    </div>
  );
}

function taskBlockedReports(
  reports: BlockedReport[] | undefined,
  taskId: ID,
): BlockedReport[] {
  return (reports ?? []).filter(
    (report) => report.task_id === taskId && report.status === "open",
  );
}

function buildLocalAnalysis({
  card,
  detail,
  comments,
  blockedReports,
}: {
  card: KanbanTaskCard;
  detail?: TaskDetailResponse;
  comments: TaskComment[];
  blockedReports: BlockedReport[];
}) {
  const latestQuestion = detail?.related_ai_questions?.[0];
  const hasBlocker =
    card.status === "blocked" ||
    blockedReports.length > 0 ||
    card.latest_signal?.signal_type === "blocked_task";

  return [
    {
      label: "Progress read",
      value:
        card.status === "in_review"
          ? "The newcomer has submitted this task and is waiting for mentor review."
          : card.status === "blocked"
            ? "The task is marked blocked. Start with the blocker evidence before asking for more delivery work."
            : `The task is in ${card.status.replaceAll("_", " ")} and has been in this lane for ${card.days_in_status} day${card.days_in_status === 1 ? "" : "s"}.`,
    },
    {
      label: "Blocker signal",
      value: hasBlocker
        ? blockedReports[0]?.details ||
          card.latest_signal?.title ||
          "There is an active blocker or AI signal attached to this task."
        : "No explicit blocker is attached. Look for hidden friction in comments or recent AI questions.",
    },
    {
      label: "Evidence",
      value: latestQuestion
        ? `The newcomer recently asked: "${latestQuestion.question}"`
        : comments.length
          ? `${comments.length} task comment${comments.length === 1 ? "" : "s"} available for review.`
          : "No chat or AI-question evidence is attached yet.",
    },
    {
      label: "Next mentor move",
      value:
        card.status === "in_review"
          ? "Approve if the acceptance criteria are met, or return with specific feedback in the chat."
          : hasBlocker
            ? "Reply with one concrete unblock step and name the source or teammate that can help."
            : "Ask for proof of work, clarify the expected output, or move the card when the status changes.",
    },
  ];
}

function buildMentorAnalysisPrompt({
  card,
  detail,
  comments,
  blockedReports,
}: {
  card: KanbanTaskCard;
  detail: TaskDetailResponse;
  comments: TaskComment[];
  blockedReports: BlockedReport[];
}) {
  const task = detail.task;
  const acceptance = splitCriteria(task.acceptance_criteria);
  const commentText = comments
    .slice(-8)
    .map((comment) => `- [${comment.comment_type}] ${comment.body}`)
    .join("\n");
  const reports = blockedReports
    .map(
      (report) =>
        `- ${humanizeBlocker(report.blocker_type)}: ${report.details || report.ai_suggestion || "No details"}`,
    )
    .join("\n");
  const questions = (detail.related_ai_questions ?? [])
    .slice(0, 5)
    .map((question) => `- ${question.question}`)
    .join("\n");

  return [
    "You are a mentor cockpit assistant. Analyze this onboarding task for the mentor.",
    "Answer with: 1) where the newcomer is, 2) why they may be blocked, 3) what they have already done or asked, 4) the next best mentor reply.",
    "Be concise and practical.",
    "",
    `Newcomer: ${card.newcomer.full_name}`,
    card.newcomer.job_title ? `Role: ${card.newcomer.job_title}` : null,
    `Task: ${task.title}`,
    `Status: ${task.status}`,
    `Priority: ${task.priority}`,
    `Days in status: ${card.days_in_status}`,
    `Urgency score: ${card.urgency_score}`,
    task.description ? `Description: ${task.description}` : null,
    acceptance.length
      ? `Acceptance criteria:\n${acceptance.map((item) => `- ${item}`).join("\n")}`
      : null,
    card.latest_signal
      ? `Latest AI signal: ${humanizeSignalType(card.latest_signal.signal_type)} (${card.latest_signal.severity}) - ${card.latest_signal.title}`
      : null,
    reports ? `Open blocked reports:\n${reports}` : null,
    questions ? `Newcomer AI questions:\n${questions}` : null,
    commentText ? `Task comments:\n${commentText}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function splitCriteria(value?: string | null) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function humanizeBlocker(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
