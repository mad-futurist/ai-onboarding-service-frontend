"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Loader2,
  MessageCircle,
  PlayCircle,
  Send,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { BlockedTrigger } from "@/components/newcomer/BlockedDialog";
import { InteractiveChecklist } from "@/components/newcomer/task/InteractiveChecklist";

import { getTaskDetail, updateTaskStatus } from "@/services/tasks";
import {
  createTaskComment,
  listTaskComments,
} from "@/services/task-comments";
import { toApiError } from "@/lib/api";
import { fmtRelative } from "@/lib/format";
import { cn, getInitials } from "@/lib/utils";
import { useDemo } from "@/providers/demo-provider";
import type { TaskExample, TaskLink } from "@/types";
import type { TaskComment } from "@/services/task-comments";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 26 } as const,
  },
};

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const router = useRouter();
  const qc = useQueryClient();
  const reduce = useReducedMotion();
  const { activePersona, mentorId, mentorName, newcomerName } = useDemo();
  const [chatDraft, setChatDraft] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["task-detail", id],
    queryFn: () => getTaskDetail(id),
    enabled: Number.isFinite(id),
  });

  const commentsQuery = useQuery({
    queryKey: ["task-comments", id],
    queryFn: () => listTaskComments(id),
    enabled: Number.isFinite(id),
  });

  const [progressRatio, setProgressRatio] = React.useState(0);

  const statusMut = useMutation({
    mutationFn: (nextStatus: "in_progress" | "in_review") =>
      updateTaskStatus(id, nextStatus),
    onSuccess: (_, nextStatus) => {
      toast.success(
        nextStatus === "in_review" ? "Submitted for review" : "Task started",
        {
          description:
            nextStatus === "in_review"
              ? "Your mentor will review and respond."
              : undefined,
        },
      );
      qc.invalidateQueries({ queryKey: ["task-detail", id] });
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
      qc.invalidateQueries({ queryKey: ["task-comments", id] });
      qc.invalidateQueries({ queryKey: ["mentor-kanban"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) =>
      toast.error("Couldn't update", { description: toApiError(err).message }),
  });

  const commentMut = useMutation({
    mutationFn: (body: string) =>
      createTaskComment(id, body, {
        commentType: "general",
        authorUserId: activePersona?.user_id ?? null,
      }),
    onSuccess: () => {
      toast.success("Message sent");
      setChatDraft("");
      qc.invalidateQueries({ queryKey: ["task-comments", id] });
      qc.invalidateQueries({ queryKey: ["mentor-kanban"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) =>
      toast.error("Couldn't send message", {
        description: toApiError(err).message,
      }),
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
  const inReview = task.status === "in_review";
  const acceptanceItems = splitCriteria(task.acceptance_criteria);
  const examples = task.examples ?? [];
  const links = task.links ?? [];
  const latestReturn =
    (commentsQuery.data ?? []).find((c) => c.comment_type === "review_return") ??
    null;
  const conversationComments = [...(commentsQuery.data ?? [])]
    .filter((comment) => comment.comment_type !== "status_change")
    .reverse();

  const allChecked =
    acceptanceItems.length > 0 && progressRatio >= 1 - 1e-6;
  const ctaReady = allChecked && task.status === "in_progress";

  return (
    <>
      <motion.div
        className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6 pb-28 lg:pb-8"
        data-demo-id="newcomer-task-detail"
        variants={stagger}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between gap-3"
        >
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusBadge status={task.status} />
            {task.priority ? <PriorityBadge priority={task.priority} /> : null}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="relative">
          <div
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-70 blur-2xl transition-opacity duration-500",
              done
                ? "bg-emerald-200/40"
                : ctaReady
                  ? "bg-[color:var(--color-primary-soft)]/70"
                  : "bg-[color:var(--color-primary-softer)]/40",
            )}
          />
          <PageHeader
            eyebrow={task.week_number ? `Week ${task.week_number}` : "Task"}
            title={task.title}
            description={taskSubtitle(task)}
            actions={
              <>
                <BlockedTrigger taskId={task.id} />
                <Button asChild variant="outline">
                  <Link href={`/newcomer/tasks/${task.id}/ask`} data-demo-id="newcomer-task-chat">
                    <MessageCircle className="h-4 w-4" /> Ask AI
                  </Link>
                </Button>
                <TaskReviewButton
                  status={task.status}
                  ready={ctaReady}
                  pending={statusMut.isPending}
                  pendingStatus={statusMut.variables}
                  onStart={() => statusMut.mutate("in_progress")}
                  onSubmit={() => statusMut.mutate("in_review")}
                />
              </>
            }
          />
          {done ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 14 }}
              className="absolute -top-2 -right-2 hidden md:inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm"
            >
              <Sparkles className="h-3 w-3" /> Completed
            </motion.div>
          ) : null}
        </motion.div>

        {latestReturn && task.status === "in_progress" ? (
          <motion.div variants={fadeUp}>
            <div className="rounded-[18px] border border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)]/25 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-danger-fg)]">
                <MessageCircle className="h-3.5 w-3.5" />
                Mentor review note
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
                {latestReturn.body}
              </p>
            </div>
          </motion.div>
        ) : null}

        {inReview ? (
          <motion.div variants={fadeUp}>
            <div className="rounded-[18px] border border-[color:var(--color-info-soft)] bg-[color:var(--color-info-soft)]/25 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-info-fg)]">
                <Eye className="h-3.5 w-3.5" />
                Waiting for mentor review
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                Your task is with your mentor. If changes are needed, it will
                come back to In progress with feedback.
              </p>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          variants={fadeUp}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"
        >
          <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[color:var(--color-primary)]" />{" "}
                Description
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

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[color:var(--color-primary)]" />{" "}
                Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <MetaRow label="Week" value={task.week_number ?? "—"} />
              <MetaRow label="Day" value={task.day_number ?? "—"} />
              <MetaRow label="Type" value={task.task_type || "—"} />
              <MetaRow label="Priority" value={task.priority || "—"} />
            </CardContent>
          </Card>
        </motion.div>

        {data.why_it_matters ? (
          <motion.div variants={fadeUp}>
            <AIInsightCard
              title="Why this matters"
              tone="soft"
              description={data.why_it_matters}
            />
          </motion.div>
        ) : null}

        <motion.div variants={fadeUp}>
          <InteractiveChecklist
            items={acceptanceItems}
            taskId={task.id}
            onProgressChange={setProgressRatio}
          />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <ExamplesCard examples={examples} />
          <LinksCard links={links} />
        </motion.div>

        <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" />{" "}
                Related sources
              </CardTitle>
              <CardDescription>From your team knowledge base.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.related_documents?.length ? (
                data.related_documents.map((d, index) => (
                  <motion.div
                    key={d.id}
                    whileHover={reduce ? undefined : { x: 3 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <Link
                      href={`/newcomer/knowledge/${d.id}`}
                      data-demo-id={index === 0 ? "newcomer-task-first-source" : undefined}
                      className="group flex items-start gap-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3 text-left transition-colors hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/30"
                      aria-label={`Open source ${d.title}`}
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[color:var(--color-fg)] group-hover:text-[color:var(--color-primary-active)]">
                          {d.title}
                        </div>
                        <div className="text-xs text-[color:var(--color-fg-muted)]">
                          {d.domain}
                        </div>
                      </div>
                      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-faint)] transition-colors group-hover:text-[color:var(--color-primary)]" />
                    </Link>
                  </motion.div>
                ))
              ) : (
                <EmptyInline>No related sources surfaced yet.</EmptyInline>
              )}
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[color:var(--color-primary)]" />{" "}
                People who can help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.people_to_ask?.length ? (
                data.people_to_ask.map((p, i) => {
                  const name = p.name ?? p.full_name ?? "Unknown teammate";
                  const role = p.role ?? p.team;
                  return (
                    <motion.div
                      key={`${name}-${i}`}
                      whileHover={reduce ? undefined : { x: 3 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      className="flex items-center gap-3 rounded-lg px-1 py-1"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">
                          {name}
                        </div>
                        {role ? (
                          <div className="truncate text-xs text-[color:var(--color-fg-muted)]">
                            {role}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <EmptyInline>No people suggested yet.</EmptyInline>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <TaskConversation
            comments={conversationComments}
            draft={chatDraft}
            mentorId={mentorId}
            mentorName={mentorName}
            newcomerName={newcomerName}
            sending={commentMut.isPending}
            onDraftChange={setChatDraft}
            onSend={() => {
              const clean = chatDraft.trim();
              if (clean) commentMut.mutate(clean);
            }}
          />
        </motion.div>
      </motion.div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="text-xs text-[color:var(--color-fg-muted)] truncate">
            {acceptanceItems.length > 0 ? (
              <>
                {Math.round(progressRatio * 100)}% checked
              </>
            ) : (
              "Ready when you are"
            )}
          </div>
          <TaskReviewButton
            status={task.status}
            ready={ctaReady}
            pending={statusMut.isPending}
            pendingStatus={statusMut.variables}
            onStart={() => statusMut.mutate("in_progress")}
            onSubmit={() => statusMut.mutate("in_review")}
            size="md"
          />
        </div>
      </div>
    </>
  );
}

function TaskReviewButton({
  status,
  ready,
  pending,
  pendingStatus,
  onStart,
  onSubmit,
  size = "md",
}: {
  status: string;
  ready: boolean;
  pending: boolean;
  pendingStatus?: "in_progress" | "in_review";
  onStart(): void;
  onSubmit(): void;
  size?: "md" | "lg";
}) {
  const reduce = useReducedMotion();

  if (status === "done") {
    return (
      <Button variant="secondary" disabled size={size}>
        <CheckCircle2 className="h-4 w-4" /> Approved
      </Button>
    );
  }

  if (status === "in_review") {
    return (
      <Button variant="secondary" disabled size={size}>
        <Eye className="h-4 w-4" /> In review
      </Button>
    );
  }

  if (status === "blocked") {
    return (
      <Button
        variant="outline"
        disabled={pending}
        onClick={onStart}
        size={size}
        className="gap-1.5"
      >
        {pending && pendingStatus === "in_progress" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlayCircle className="h-4 w-4" />
        )}
        Resume task
      </Button>
    );
  }

  if (status === "todo") {
    return (
      <Button
        variant="ai"
        disabled={pending}
        onClick={onStart}
        size={size}
        className="gap-1.5"
      >
        {pending && pendingStatus === "in_progress" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlayCircle className="h-4 w-4" />
        )}
        Start task
      </Button>
    );
  }

  return (
    <motion.div
      className="relative inline-flex"
      animate={
        reduce || !ready
          ? undefined
          : { scale: [1, 1.04, 1] }
      }
      transition={{
        duration: 1.6,
        repeat: ready ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      {ready ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-xl ai-gradient opacity-50 blur-md"
        />
      ) : null}
      <Button
        variant="ai"
        disabled={pending}
        onClick={onSubmit}
        size={size}
        data-demo-id="newcomer-task-submit-review"
        className="relative gap-1.5"
      >
        {pending && pendingStatus === "in_review" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {pending && pendingStatus === "in_review"
          ? "Submitting..."
          : "Submit for review"}
      </Button>
    </motion.div>
  );
}

function ExamplesCard({ examples }: { examples: TaskExample[] }) {
  const reduce = useReducedMotion();
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" />{" "}
          Examples
        </CardTitle>
        <CardDescription>
          Concrete examples or references for the task.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {examples.length ? (
          examples.map((example, index) => (
            <motion.article
              key={`${example.title}-${index}`}
              whileHover={reduce ? undefined : { y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="rounded-lg border border-[color:var(--color-border)] bg-white p-3 transition-shadow hover:shadow-sm"
            >
              <div className="text-sm font-semibold text-[color:var(--color-fg)]">
                {example.title || `Example ${index + 1}`}
              </div>
              {example.content ? (
                <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  {example.content}
                </p>
              ) : null}
            </motion.article>
          ))
        ) : (
          <EmptyInline>No examples yet.</EmptyInline>
        )}
      </CardContent>
    </Card>
  );
}

function LinksCard({ links }: { links: TaskLink[] }) {
  const reduce = useReducedMotion();
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-[color:var(--color-primary)]" /> Links
        </CardTitle>
        <CardDescription>Helpful material for this task.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {links.length ? (
          links.map((item, index) => (
            <motion.a
              key={`${item.url}-${index}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              whileHover={reduce ? undefined : { x: 3 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm text-[color:var(--color-fg)] transition hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-surface-muted)]/40"
            >
              <span className="truncate">{item.label || item.url}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-faint)]" />
            </motion.a>
          ))
        ) : (
          <EmptyInline>No links yet.</EmptyInline>
        )}
      </CardContent>
    </Card>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[color:var(--color-surface-muted)] px-3 py-2 text-sm">
      <span className="text-[color:var(--color-fg-subtle)]">{label}</span>
      <span className="truncate font-medium text-[color:var(--color-fg)]">
        {value}
      </span>
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

function TaskConversation({
  comments,
  draft,
  mentorId,
  mentorName,
  newcomerName,
  sending,
  onDraftChange,
  onSend,
}: {
  comments: TaskComment[];
  draft: string;
  mentorId: number | null;
  mentorName: string;
  newcomerName: string;
  sending: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
}) {
  const canSend = draft.trim().length > 0 && !sending;

  return (
    <Card className="relative overflow-hidden">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] ai-gradient" />
      <CardHeader className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/95">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
                <MessageCircle className="h-4 w-4" />
              </span>
              Task conversation
            </CardTitle>
            <CardDescription className="mt-1">
              Mentor feedback and task-level replies stay here.
            </CardDescription>
          </div>
          <span className="inline-flex h-7 items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2.5 text-xs font-semibold tabular-nums text-[color:var(--color-fg-muted)]">
            {comments.length} message{comments.length === 1 ? "" : "s"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3 bg-[color:var(--color-surface-muted)]/25 p-4 sm:p-5">
          {comments.length ? (
            comments.map((comment) => (
              <TaskConversationBubble
                key={comment.id}
                comment={comment}
                mentorId={mentorId}
                mentorName={mentorName}
                newcomerName={newcomerName}
              />
            ))
          ) : (
            <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white p-6 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-[12px] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-semibold text-[color:var(--color-fg)]">
                No task messages yet
              </div>
              <p className="mx-auto mt-1 max-w-md text-sm text-[color:var(--color-fg-muted)]">
                Use this thread for mentor feedback, blockers, evidence, and task-specific follow-up.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[color:var(--color-border)] bg-white p-4 sm:p-5">
          <Textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && canSend) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder="Reply to your mentor or explain what is blocking you..."
            className="min-h-[92px] rounded-[12px] bg-[color:var(--color-surface-muted)]/30"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[color:var(--color-fg-muted)]">
              Press Enter to send, Shift+Enter for a new line.
            </p>
            <Button
              type="button"
              variant="ai"
              size="sm"
              disabled={!canSend}
              onClick={onSend}
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send reply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskConversationBubble({
  comment,
  mentorId,
  mentorName,
  newcomerName,
}: {
  comment: TaskComment;
  mentorId: number | null;
  mentorName: string;
  newcomerName: string;
}) {
  const fromMentor =
    comment.comment_type === "review_return" ||
    (mentorId != null && comment.author_user_id === mentorId);
  const label = fromMentor ? mentorName : newcomerName;
  const isMine = !fromMentor;

  return (
    <div className={cn("flex gap-3", isMine && "justify-end")}>
      {fromMentor ? (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(label)}</AvatarFallback>
        </Avatar>
      ) : null}
      <div
        className={cn(
          "max-w-[88%] rounded-[16px] border px-3 py-2 shadow-sm",
          isMine
            ? "rounded-br-md border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)]"
            : "rounded-bl-md border-[color:var(--color-border)] bg-white",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          <span>{isMine ? "You" : "Mentor"}</span>
          {comment.comment_type === "review_return" ? (
            <span className="rounded-full bg-[color:var(--color-danger-soft)] px-1.5 py-0.5 text-[color:var(--color-danger-fg)]">
              Review note
            </span>
          ) : null}
          <span>{fmtRelative(comment.created_at)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

function splitCriteria(value?: string | null) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function taskSubtitle(task: {
  week_number: number | null;
  day_number: number | null;
  task_type: string;
}) {
  const parts = [];
  if (task.week_number) parts.push(`Week ${task.week_number}`);
  if (task.day_number) parts.push(`Day ${task.day_number}`);
  if (task.task_type) parts.push(task.task_type);
  return parts.length ? parts.join(" · ") : "Onboarding task";
}
