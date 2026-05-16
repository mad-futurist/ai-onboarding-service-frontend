"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  MessageCircle,
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
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { BlockedTrigger } from "@/components/newcomer/BlockedDialog";
import { InteractiveChecklist } from "@/components/newcomer/task/InteractiveChecklist";
import { TaskCompleteOverlay } from "@/components/newcomer/task/TaskCompleteOverlay";

import { getTaskDetail, updateTaskStatus } from "@/services/tasks";
import { toApiError } from "@/lib/api";
import { cn, getInitials } from "@/lib/utils";
import type { TaskExample, TaskLink } from "@/types";

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

  const { data, isLoading } = useQuery({
    queryKey: ["task-detail", id],
    queryFn: () => getTaskDetail(id),
    enabled: Number.isFinite(id),
  });

  const [progressRatio, setProgressRatio] = React.useState(0);
  const [showCelebration, setShowCelebration] = React.useState(false);

  const completeMut = useMutation({
    mutationFn: () => updateTaskStatus(id, "done"),
    onSuccess: () => {
      setShowCelebration(true);
      qc.invalidateQueries({ queryKey: ["task-detail", id] });
      qc.invalidateQueries({ queryKey: ["newcomer-plan"] });
      qc.invalidateQueries({ queryKey: ["newcomer-dashboard"] });
    },
    onError: (err) =>
      toast.error("Couldn't update", { description: toApiError(err).message }),
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
  const examples = task.examples ?? [];
  const links = task.links ?? [];

  const allChecked =
    acceptanceItems.length > 0 && progressRatio >= 1 - 1e-6;
  const ctaReady = allChecked && !done;

  return (
    <>
      <motion.div
        className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6 pb-28 lg:pb-8"
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
                  <Link href={`/newcomer/tasks/${task.id}/ask`}>
                    <MessageCircle className="h-4 w-4" /> Chat
                  </Link>
                </Button>
                <CompleteButton
                  done={done}
                  ready={ctaReady}
                  pending={completeMut.isPending}
                  onClick={() => completeMut.mutate()}
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
                data.related_documents.map((d) => (
                  <motion.article
                    key={d.id}
                    whileHover={reduce ? undefined : { x: 3 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="flex items-start gap-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3 transition-colors hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/30"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">
                        {d.title}
                      </div>
                      <div className="text-xs text-[color:var(--color-fg-muted)]">
                        {d.domain}
                      </div>
                    </div>
                  </motion.article>
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
          <CompleteButton
            done={done}
            ready={ctaReady}
            pending={completeMut.isPending}
            onClick={() => completeMut.mutate()}
            size="md"
          />
        </div>
      </div>

      <AnimatePresence>
        {showCelebration ? (
          <TaskCompleteOverlay
            open={showCelebration}
            taskTitle={task.title}
            onClose={() => {
              setShowCelebration(false);
              router.push("/newcomer");
            }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function CompleteButton({
  done,
  ready,
  pending,
  onClick,
  size = "md",
}: {
  done: boolean;
  ready: boolean;
  pending: boolean;
  onClick(): void;
  size?: "md" | "lg";
}) {
  const reduce = useReducedMotion();

  if (done) {
    return (
      <Button variant="secondary" disabled size={size}>
        <CheckCircle2 className="h-4 w-4" /> Done
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
        onClick={onClick}
        size={size}
        className="relative"
      >
        <Check className="h-4 w-4" />
        {pending ? "Marking…" : ready ? "Mark as done 🎉" : "Mark as done"}
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
