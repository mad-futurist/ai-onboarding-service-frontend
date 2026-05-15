"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Users,
} from "lucide-react";

import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { SourceCitation } from "@/components/ai/SourceCitation";
import { Markdown } from "@/components/shared/Markdown";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { askAI, submitAnswerFeedback } from "@/services/ai";
import { getTaskDetail } from "@/services/tasks";
import { toApiError } from "@/lib/api";
import { cn, getInitials } from "@/lib/utils";
import { useDemo } from "@/providers/demo-provider";
import type { AIAskResponse, TaskDetailResponse } from "@/types";

interface ChatItem {
  question: string;
  response?: AIAskResponse;
  pending?: boolean;
  errored?: string;
}

export default function TaskAskAIPage() {
  const params = useParams<{ id: string }>();
  const taskId = Number(params?.id);
  const { newcomerId, newcomerName } = useDemo();
  const [draft, setDraft] = React.useState("Help me complete this task step by step.");
  const [chat, setChat] = React.useState<ChatItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["task-detail", taskId],
    queryFn: () => getTaskDetail(taskId),
    enabled: Number.isFinite(taskId),
  });

  const askMut = useMutation({
    mutationFn: (question: string) => {
      if (!data) throw new Error("Task context is not ready yet.");
      return askAI({
        question: buildContextualQuestion(question, data),
        newcomer_id: newcomerId ?? undefined,
        top_k: 5,
      });
    },
  });

  const submit = async (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || !data) return;

    const placeholder: ChatItem = { question: cleanQuestion, pending: true };
    setChat((items) => [...items, placeholder]);
    setDraft("");

    try {
      const response = await askMut.mutateAsync(cleanQuestion);
      setChat((items) =>
        items.map((item) => (item === placeholder ? { ...item, pending: false, response } : item)),
      );
    } catch (error) {
      const message = toApiError(error).message;
      setChat((items) =>
        items.map((item) => (item === placeholder ? { ...item, pending: false, errored: message } : item)),
      );
      toast.error("AI couldn't answer", { description: message });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void submit(draft);
  };

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="h-10 w-64" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const task = data.task;
  const suggestions = buildSuggestions(data);
  const lastSources = chat[chat.length - 1]?.response?.sources;
  const lastFollowups = chat[chat.length - 1]?.response?.follow_up_questions;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4">
        <Button asChild variant="ghost">
          <Link href={`/newcomer/tasks/${task.id}`}>
            <ArrowLeft className="h-4 w-4" /> Back to task
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow={task.week_number ? `Week ${task.week_number} task chat` : "Task chat"}
        title={task.title}
        description="Ask for help with this task. The AI already has the task description, acceptance criteria, related sources, and suggested people in context."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          {chat.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl ai-gradient text-white shadow-[var(--shadow-ai)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Chat with task context</div>
                    <div className="text-xs text-[color:var(--color-fg-muted)]">
                      Start with a suggested prompt or ask what is blocking you.
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {suggestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void submit(question)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-left text-sm text-[color:var(--color-fg)] hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/40"
                    >
                      <span className="truncate">{question}</span>
                      <Send className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="space-y-5">
            {chat.map((item, index) => (
              <ChatMessage key={index} item={item} name={newcomerName} />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="sticky bottom-4 z-10">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-2 shadow-[var(--shadow-elevated)]">
              <div className="ai-border rounded-xl">
                <Textarea
                  rows={2}
                  placeholder="Ask for help with this task..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submit(draft);
                    }
                  }}
                  className="rounded-xl border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-2 pt-2">
                <span className="text-[11px] text-[color:var(--color-fg-subtle)]">
                  Task context is included with every message.
                </span>
                <Button type="submit" variant="ai" size="sm" disabled={!draft.trim() || askMut.isPending}>
                  <Send className="h-3.5 w-3.5" /> Send
                </Button>
              </div>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <TaskContextCard data={data} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[color:var(--color-primary)]" /> Sources used
              </CardTitle>
              <CardDescription>
                {lastSources?.length ? "From the latest answer." : "Sources will appear after the AI answers."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {lastSources?.length ? (
                lastSources.map((source, index) => <SourceCitation key={index} source={source} index={index} />)
              ) : (
                <div className="text-xs text-[color:var(--color-fg-muted)]">No sources yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[color:var(--color-primary)]" /> Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {(lastFollowups ?? suggestions).map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void submit(question)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-muted)]"
                >
                  <span className="truncate">{question}</span>
                  <Send className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)]" />
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function TaskContextCard({ data }: { data: TaskDetailResponse }) {
  const task = data.task;
  const acceptanceItems = splitCriteria(task.acceptance_criteria);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[color:var(--color-primary)]" /> Task context
        </CardTitle>
        <CardDescription>Included automatically in the AI prompt.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description ? (
          <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{task.description}</p>
        ) : null}

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            Acceptance criteria
          </div>
          {acceptanceItems.length ? (
            <ul className="mt-2 space-y-2">
              {acceptanceItems.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2 text-sm text-[color:var(--color-fg)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-success-fg)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 text-xs text-[color:var(--color-fg-muted)]">No acceptance criteria yet.</div>
          )}
        </div>

        {data.people_to_ask?.length ? (
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              <Users className="h-3 w-3" /> People to ask
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.people_to_ask.map((person, index) => {
                const name = person.name ?? person.full_name ?? "Unknown teammate";
                const role = person.role ?? person.team;
                return (
                  <span
                    key={`${name}-${index}`}
                    className="rounded-full border border-[color:var(--color-border)] bg-white px-2 py-1 text-xs text-[color:var(--color-fg)]"
                  >
                    {name}
                    {role ? <span className="text-[color:var(--color-fg-subtle)]"> - {role}</span> : null}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ChatMessage({ item, name }: { item: ChatItem; name: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-2xl rounded-tl-md bg-[color:var(--color-surface-muted)] p-3 text-sm text-[color:var(--color-fg)]">
          {item.question}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full ai-gradient text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          {item.pending ? (
            <AIInsightCard title="Thinking..." tone="soft">
              <div className="space-y-2">
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </AIInsightCard>
          ) : item.errored ? (
            <AIInsightCard title="Something went wrong" description={item.errored} tone="soft" />
          ) : item.response ? (
            <AIInsightCard
              title="Answer"
              tone="soft"
              actions={
                <>
                  <FeedbackButton questionId={item.response.question_id} positive />
                  <FeedbackButton questionId={item.response.question_id} positive={false} />
                </>
              }
            >
              <Markdown>{item.response.answer}</Markdown>
              {item.response.people_to_ask?.length ? (
                <div className="mt-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    <Users className="h-3 w-3" /> People to ask
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {item.response.people_to_ask.map((person, index) => (
                      <div
                        key={`${person.name}-${index}`}
                        className="flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-2 py-0.5 text-xs"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px]">{getInitials(person.name)}</AvatarFallback>
                        </Avatar>
                        {person.name}
                        {person.role ? <span className="text-[color:var(--color-fg-subtle)]"> - {person.role}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </AIInsightCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FeedbackButton({ questionId, positive }: { questionId: number; positive: boolean }) {
  const [sent, setSent] = React.useState(false);
  const mutation = useMutation({
    mutationFn: () =>
      submitAnswerFeedback(questionId, { feedback_type: positive ? "thumbs_up" : "thumbs_down" }),
    onSuccess: () => {
      setSent(true);
      toast.success(positive ? "Thanks, glad it helped" : "Noted, AI will improve");
    },
  });

  const Icon = positive ? ThumbsUp : ThumbsDown;

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={sent || mutation.isPending}
      onClick={() => mutation.mutate()}
      title={positive ? "Helpful" : "Not helpful"}
    >
      <Icon className={cn("h-3.5 w-3.5", sent && positive && "text-[color:var(--color-success)]")} />
    </Button>
  );
}

function buildSuggestions(data: TaskDetailResponse) {
  const suggestedPrompt = data.suggested_prompt?.trim();
  return [
    suggestedPrompt || "Help me complete this task step by step.",
    "What should I do first?",
    "How do I know this task is accepted?",
    "Which sources or teammates can help me?",
  ];
}

function buildContextualQuestion(question: string, data: TaskDetailResponse) {
  const task = data.task;
  const acceptance = splitCriteria(task.acceptance_criteria);
  const people = (data.people_to_ask ?? [])
    .map((person) => {
      const name = person.name ?? person.full_name ?? "Unknown teammate";
      const role = person.role ?? person.team;
      return role ? `${name} (${role})` : name;
    })
    .join(", ");
  const documents = (data.related_documents ?? []).map((document) => document.title).join(", ");

  return [
    "You are helping a newcomer complete an onboarding task. Use the task context below and answer with practical next steps.",
    "",
    `Task title: ${task.title}`,
    `Task status: ${task.status}`,
    task.week_number ? `Week: ${task.week_number}` : null,
    task.day_number ? `Day: ${task.day_number}` : null,
    task.task_type ? `Type: ${task.task_type}` : null,
    task.priority ? `Priority: ${task.priority}` : null,
    task.description ? `Description: ${task.description}` : null,
    acceptance.length ? `Acceptance criteria:\n${acceptance.map((item) => `- ${item}`).join("\n")}` : null,
    data.why_it_matters ? `Why it matters: ${data.why_it_matters}` : null,
    documents ? `Related sources: ${documents}` : null,
    people ? `People to ask: ${people}` : null,
    "",
    `Newcomer question: ${question}`,
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
