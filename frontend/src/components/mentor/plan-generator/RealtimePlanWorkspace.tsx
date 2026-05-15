"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  HelpCircle,
  MessageSquare,
  Pause,
  Play,
  Route,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Newcomer } from "@/types";

type LiveStatus = "idle" | "running" | "paused" | "ready";
type LiveEventTone = "thinking" | "question" | "comment" | "done";

interface LiveEvent {
  id: string;
  title: string;
  body: string;
  tone: LiveEventTone;
}

interface LiveQuestionTest {
  id: string;
  label: string;
  checked: boolean;
}

interface LiveQuestion {
  id: string;
  question: string;
  reason: string;
  answer?: string;
  tests: LiveQuestionTest[];
}

interface LiveComment {
  id: string;
  body: string;
  createdAt: string;
}

interface LiveStep {
  event: LiveEvent;
  question?: LiveQuestion;
}

interface RealtimePlanWorkspaceProps {
  newcomer?: Newcomer;
  selectedDocumentCount: number;
  mentorNotes: string;
  generating: boolean;
  onGenerate: (mentorNotes: string) => void;
}

export function RealtimePlanWorkspace({
  newcomer,
  selectedDocumentCount,
  mentorNotes,
  generating,
  onGenerate,
}: RealtimePlanWorkspaceProps) {
  const [status, setStatus] = React.useState<LiveStatus>("idle");
  const [stepIndex, setStepIndex] = React.useState(0);
  const [events, setEvents] = React.useState<LiveEvent[]>([]);
  const [questions, setQuestions] = React.useState<LiveQuestion[]>([]);
  const [comments, setComments] = React.useState<LiveComment[]>([]);
  const [commentDraft, setCommentDraft] = React.useState("");

  const script = React.useMemo(
    () => buildLivePlanScript(newcomer, selectedDocumentCount, mentorNotes),
    [newcomer, selectedDocumentCount, mentorNotes],
  );

  React.useEffect(() => {
    if (status !== "running") return;

    const timer = window.setTimeout(() => {
      const step = script[stepIndex];
      if (!step) {
        setStatus("ready");
        return;
      }

      setEvents((prev) => [...prev, step.event]);
      if (step.question) {
        setQuestions((prev) =>
          prev.some((question) => question.id === step.question!.id)
            ? prev
            : [...prev, step.question!],
        );
      }
      setStepIndex((prev) => prev + 1);
      if (stepIndex >= script.length - 1) {
        setStatus("ready");
      }
    }, stepIndex === 0 ? 250 : 900);

    return () => window.clearTimeout(timer);
  }, [script, status, stepIndex]);

  const progress = script.length ? Math.round((stepIndex / script.length) * 100) : 0;
  const answered = questions.filter((question) => question.answer?.trim()).length;
  const checkedTests = questions.flatMap((question) => question.tests).filter((test) => test.checked).length;
  const totalTests = questions.flatMap((question) => question.tests).length;
  const isActive = status === "running" || status === "paused" || status === "ready";

  const start = () => {
    setEvents([]);
    setQuestions([]);
    setComments([]);
    setCommentDraft("");
    setStepIndex(0);
    setStatus("running");
  };

  const addComment = () => {
    const body = commentDraft.trim();
    if (!body) return;
    const id = `comment-${Date.now()}`;
    setComments((prev) => [...prev, { id, body, createdAt: new Date().toISOString() }]);
    setEvents((prev) => [
      ...prev,
      {
        id: `event-${id}`,
        title: "Mentor comment added",
        body,
        tone: "comment",
      },
    ]);
    setCommentDraft("");
  };

  const updateQuestionAnswer = (id: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((question) => (question.id === id ? { ...question, answer } : question)),
    );
  };

  const toggleQuestionTest = (questionId: string, testId: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              tests: question.tests.map((test) =>
                test.id === testId ? { ...test, checked: !test.checked } : test,
              ),
            }
          : question,
      ),
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-4 w-4 text-[color:var(--color-primary)]" /> Live generation workspace
            </CardTitle>
            <CardDescription>
              A visible generation plan, AI reasoning, doubt questions, validation tests, and mentor comments before creating the draft.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {status === "idle" ? (
              <Button variant="ai" disabled={!newcomer} onClick={start}>
                <Play className="h-4 w-4" /> Start live mode
              </Button>
            ) : null}
            {status === "running" ? (
              <Button variant="outline" onClick={() => setStatus("paused")}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
            ) : null}
            {status === "paused" ? (
              <Button variant="ai" onClick={() => setStatus("running")}>
                <Play className="h-4 w-4" /> Resume
              </Button>
            ) : null}
            {isActive ? (
              <Button
                variant={status === "ready" ? "ai" : "outline"}
                disabled={!newcomer || generating || status === "running"}
                onClick={() => onGenerate(buildLiveMentorNotes(mentorNotes, questions, comments))}
              >
                <Wand2 className="h-4 w-4" />
                {generating ? "Creating draft..." : "Generate draft"}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <StepPill active={status === "idle"} done={isActive} icon={<FileText className="h-3 w-3" />} label="Setup" />
          <StepPill active={status === "running" || status === "paused"} done={status === "ready"} icon={<Eye className="h-3 w-3" />} label="Live review" />
          <StepPill active={questions.length > 0} done={questions.length > 0 && answered === questions.length} icon={<HelpCircle className="h-3 w-3" />} label="Doubts" />
          <StepPill active={status === "ready"} done={false} icon={<CheckCircle2 className="h-3 w-3" />} label="Draft" />
        </div>
        <Progress value={progress} />
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="plan" className="space-y-4">
          <TabsList className="flex h-auto flex-wrap justify-start bg-white border border-[color:var(--color-border)]">
            <TabsTrigger value="plan" className="gap-2">
              <Route className="h-3.5 w-3.5" /> Generation plan
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="gap-2">
              <Clock className="h-3.5 w-3.5" /> Reasoning
              {events.length ? <Badge tone="neutral" size="sm">{events.length}</Badge> : null}
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <HelpCircle className="h-3.5 w-3.5" /> Questions
              {questions.length ? <Badge tone="warning" size="sm">{questions.length}</Badge> : null}
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-3.5 w-3.5" /> Comments
              {comments.length ? <Badge tone="ai" size="sm">{comments.length}</Badge> : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan">
            <div className="grid gap-3 md:grid-cols-2">
              {script.map((step, index) => (
                <div
                  key={step.event.id}
                  className="rounded-lg border border-[color:var(--color-border)] bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-[color:var(--color-surface-muted)] text-xs font-semibold text-[color:var(--color-fg-muted)]">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[color:var(--color-fg)]">{step.event.title}</div>
                      <div className="text-xs text-[color:var(--color-fg-muted)]">
                        {step.question ? "Needs mentor input" : "Automatic check"}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                    {step.event.body}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reasoning">
            {events.length ? (
              <ol className="space-y-2">
                {events.map((event) => (
                  <li key={event.id} className="rounded-lg border border-[color:var(--color-border)] bg-white px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-fg)]">
                      <EventIcon tone={event.tone} />
                      {event.title}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{event.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyLiveState title="Reasoning appears here" description="Start live mode to watch each generation step as it happens." />
            )}
          </TabsContent>

          <TabsContent value="questions">
            {questions.length ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-fg-muted)]">
                  <Badge tone={answered === questions.length ? "success" : "warning"} size="sm">
                    {answered}/{questions.length} text answers
                  </Badge>
                  {totalTests ? (
                    <Badge tone={checkedTests === totalTests ? "success" : "neutral"} size="sm">
                      {checkedTests}/{totalTests} tests checked
                    </Badge>
                  ) : null}
                </div>
                {questions.map((question) => (
                  <div key={question.id} className="rounded-xl border border-[color:var(--color-border)] bg-white p-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-warning-fg)]" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-[color:var(--color-fg)]">{question.question}</h3>
                        <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">{question.reason}</p>
                        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_320px]">
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                              Text answer
                            </div>
                            <Textarea
                              rows={4}
                              placeholder="Answer in text so the AI can adapt the draft..."
                              value={question.answer ?? ""}
                              onChange={(event) => updateQuestionAnswer(question.id, event.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                              Validation tests
                            </div>
                            <div className="space-y-2 rounded-lg bg-[color:var(--color-surface-muted)] p-3">
                              {question.tests.map((test) => (
                                <label key={test.id} className="flex items-start gap-2 text-xs text-[color:var(--color-fg)]">
                                  <input
                                    type="checkbox"
                                    checked={test.checked}
                                    onChange={() => toggleQuestionTest(question.id, test.id)}
                                    className="mt-0.5"
                                  />
                                  <span>{test.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyLiveState title="No doubts yet" description="If the AI detects missing context, questions and validation tests appear here." />
            )}
          </TabsContent>

          <TabsContent value="comments">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-2">
                {comments.length ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-[color:var(--color-border)] bg-white px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                        <MessageSquare className="h-3 w-3" /> Mentor comment
                      </div>
                      <p className="mt-1 text-sm text-[color:var(--color-fg)]">{comment.body}</p>
                    </div>
                  ))
                ) : (
                  <EmptyLiveState title="No live comments" description="Add steering comments while the AI is paused or reviewing." />
                )}
              </div>
              <div className="space-y-2 rounded-xl border border-[color:var(--color-border)] bg-white p-4">
                <div className="text-sm font-semibold text-[color:var(--color-fg)]">Add guidance</div>
                <Textarea
                  rows={5}
                  placeholder="Example: make week 1 lighter, add a setup checkpoint, avoid infra tasks before day 5..."
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                />
                <Button size="sm" variant="outline" onClick={addComment} disabled={!commentDraft.trim()}>
                  Add comment
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function StepPill({
  active,
  done,
  icon,
  label,
}: {
  active: boolean;
  done: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center gap-1 rounded-md border px-2 py-2 text-[10px] font-semibold uppercase tracking-wider",
        active
          ? "border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
          : done
            ? "border-[color:var(--color-success-soft)] bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]"
            : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-subtle)]",
      ].join(" ")}
    >
      {icon}
      {label}
    </div>
  );
}

function EventIcon({ tone }: { tone: LiveEventTone }) {
  if (tone === "question") return <HelpCircle className="h-3.5 w-3.5 text-[color:var(--color-warning-fg)]" />;
  if (tone === "comment") return <MessageSquare className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />;
  if (tone === "done") return <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--color-success-fg)]" />;
  return <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />;
}

function EmptyLiveState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white px-6 py-10 text-center">
      <p className="text-sm font-medium text-[color:var(--color-fg)]">{title}</p>
      <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{description}</p>
    </div>
  );
}

function buildLivePlanScript(
  newcomer: Newcomer | undefined,
  selectedDocumentCount: number,
  mentorNotes: string,
): LiveStep[] {
  const role = newcomer
    ? `${newcomer.seniority} ${newcomer.job_title} on ${newcomer.team}`
    : "the selected newcomer";
  const lowerNotes = mentorNotes.toLowerCase();
  const steps: LiveStep[] = [
    {
      event: {
        id: "profile",
        title: "Profile scan",
        body: `Read role, seniority, team, start date, and current goal for ${role}.`,
        tone: "thinking",
      },
    },
    {
      event: {
        id: "sources",
        title: selectedDocumentCount ? "Source grounding" : "Missing source grounding",
        body: selectedDocumentCount
          ? `${selectedDocumentCount} source document${selectedDocumentCount === 1 ? "" : "s"} will anchor the draft.`
          : "No source document is selected, so the draft may need mentor validation.",
        tone: selectedDocumentCount ? "thinking" : "question",
      },
      question: selectedDocumentCount
        ? undefined
        : {
            id: "source-gap",
            question: "Should the AI generate from general onboarding patterns, or should a source be added first?",
            reason: "The plan can be drafted without sources, but team-specific steps may be weaker.",
            tests: [
              { id: "source-owner", label: "The mentor knows who owns the source of truth.", checked: false },
              { id: "source-risk", label: "The first draft can be reviewed without blocking generation.", checked: false },
            ],
          },
    },
    {
      event: {
        id: "risk",
        title: "Risk check",
        body: lowerNotes.includes("weak") || lowerNotes.includes("weaker") || lowerNotes.includes("faible")
          ? "The notes mention a weaker area, so the draft should add earlier practice and checkpoints."
          : "Check whether setup, first PR, team rituals, and autonomy need extra guardrails.",
        tone: "thinking",
      },
    },
  ];

  if (!newcomer?.main_goal) {
    steps.push({
      event: {
        id: "goal-question",
        title: "Goal is unclear",
        body: "The newcomer profile does not include a main goal, so the AI needs a target outcome.",
        tone: "question",
      },
      question: {
        id: "main-goal",
        question: "What should this person be able to do confidently by the end of the first 30 days?",
        reason: "This answer helps the AI rank tasks and avoid a generic first month.",
        tests: [
          { id: "goal-measurable", label: "The goal is measurable by a mentor checkpoint.", checked: false },
          { id: "goal-role-fit", label: "The goal matches the role and seniority.", checked: false },
        ],
      },
    });
  }

  if (!newcomer?.start_date) {
    steps.push({
      event: {
        id: "start-date-question",
        title: "Timeline check",
        body: "No start date is set, so week/day sequencing may need a human anchor.",
        tone: "question",
      },
      question: {
        id: "start-date",
        question: "Is there a real start date or deadline that should shape the first week?",
        reason: "The draft can still be created, but calendar-sensitive tasks may shift.",
        tests: [
          { id: "deadline-known", label: "Any deadline or onboarding ceremony is known.", checked: false },
          { id: "first-week-load", label: "The first week has enough room for setup and meetings.", checked: false },
        ],
      },
    });
  }

  steps.push(
    {
      event: {
        id: "structure",
        title: "Draft structure",
        body: "Split the plan into a draft workspace: first-week detail, 30/60/90 phases, editable weeks, and editable tasks.",
        tone: "thinking",
      },
    },
    {
      event: {
        id: "ready",
        title: "Ready for draft generation",
        body: "The live context is ready. Generate the draft, then inspect weeks and tasks before editing.",
        tone: "done",
      },
    },
  );

  return steps;
}

function buildLiveMentorNotes(
  mentorNotes: string,
  questions: LiveQuestion[],
  comments: LiveComment[],
): string {
  const answeredQuestions = questions
    .filter((question) => question.answer?.trim())
    .map((question) => {
      const checked = question.tests
        .filter((test) => test.checked)
        .map((test) => `- ${test.label}`)
        .join("\n");
      return [
        `Q: ${question.question}`,
        `A: ${question.answer!.trim()}`,
        checked ? `Validated checks:\n${checked}` : "",
      ].filter(Boolean).join("\n");
    });
  const liveComments = comments.map((comment) => `- ${comment.body}`);

  const liveGuidance = [
    answeredQuestions.length ? `Resolved AI doubts:\n${answeredQuestions.join("\n\n")}` : "",
    liveComments.length ? `Live mentor comments:\n${liveComments.join("\n")}` : "",
  ].filter(Boolean);

  return [mentorNotes.trim(), ...liveGuidance].filter(Boolean).join("\n\n");
}
