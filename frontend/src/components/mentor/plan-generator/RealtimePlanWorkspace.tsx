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
  const [liveTab, setLiveTab] = React.useState("reasoning");

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
  const textQuestions = questions.filter((question) => question.tests.length === 0);
  const answered = textQuestions.filter((question) => question.answer?.trim()).length;
  const checkedTests = questions.flatMap((question) => question.tests).filter((test) => test.checked).length;
  const totalTests = questions.flatMap((question) => question.tests).length;
  const isActive = status === "running" || status === "paused" || status === "ready";
  const completedEventIds = new Set(events.map((event) => event.id));
  const activeTab = status === "ready" ? "plan" : liveTab;

  const start = () => {
    setEvents([]);
    setQuestions([]);
    setComments([]);
    setCommentDraft("");
    setStepIndex(0);
    setLiveTab("reasoning");
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
            {status === "ready" ? (
              <Button
                variant="ai"
                disabled={!newcomer || generating}
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
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (status !== "ready") setLiveTab(value);
          }}
          className="space-y-4"
        >
          <TabsList className="flex h-auto flex-wrap justify-start bg-white border border-[color:var(--color-border)]">
            {status === "ready" ? (
              <TabsTrigger value="plan" className="gap-2">
                <Route className="h-3.5 w-3.5" /> Generation plan
              </TabsTrigger>
            ) : (
              <>
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
              </>
            )}
          </TabsList>

          {status === "ready" ? (
          <TabsContent value="plan">
            <div className="grid gap-3 md:grid-cols-2">
              {script.map((step, index) => (
                <div
                  key={step.event.id}
                  className="rounded-lg border border-[color:var(--color-border)] bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className={[
                      "grid h-7 w-7 place-items-center rounded-md text-xs font-semibold",
                      completedEventIds.has(step.event.id)
                        ? "bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]"
                        : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
                    ].join(" ")}>
                      {completedEventIds.has(step.event.id) ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
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
          ) : null}

          <TabsContent value="reasoning">
            {events.length ? (
              <ol className="relative space-y-3 before:absolute before:left-[15px] before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-[color:var(--color-border)]">
                {events.map((event, index) => (
                  <li key={event.id} className="relative flex gap-3">
                    <div className="z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[color:var(--color-border)] bg-white">
                      <EventIcon tone={event.tone} />
                    </div>
                    <div className="flex-1 rounded-lg border border-[color:var(--color-border)] bg-white px-4 py-3 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[color:var(--color-fg)]">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                          Step {index + 1}
                        </span>
                        {event.title}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{event.body}</p>
                    </div>
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
                  {textQuestions.length ? (
                    <Badge tone={answered === textQuestions.length ? "success" : "warning"} size="sm">
                      {answered}/{textQuestions.length} text answer
                    </Badge>
                  ) : null}
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
                        <div className={question.tests.length ? "mt-3" : "mt-3 grid gap-3"}>
                          {question.tests.length === 0 ? (
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
                          ) : null}
                          {question.tests.length ? (
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
                          ) : null}
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
        title: "Source grounding",
        body: selectedDocumentCount
          ? `${selectedDocumentCount} source document${selectedDocumentCount === 1 ? "" : "s"} will anchor the draft.`
          : "No source document is selected, so the draft will need stronger mentor validation.",
        tone: "thinking",
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

  steps.push(
    {
      event: {
        id: "outcome-question",
        title: "Outcome question",
        body: "Ask for the strongest outcome before shaping the draft priorities.",
        tone: "question",
      },
      question: {
        id: "target-outcome",
        question: "What should this person be able to do confidently by the end of this period?",
        reason: "This text answer gives the AI one clear north star for the draft.",
        tests: [],
      },
    },
    {
      event: {
        id: "source-test-question",
        title: "Source confidence tests",
        body: "Check whether the available source material is enough for a useful draft.",
        tone: "question",
      },
      question: {
        id: "source-confidence",
        question: "Are the selected sources strong enough for a first draft?",
        reason: "These tests prevent a polished-looking plan from hiding weak source grounding.",
        tests: [
          { id: "source-role-fit", label: "Sources match the role and team context.", checked: false },
          { id: "source-reviewable", label: "Missing source gaps can be reviewed after draft generation.", checked: false },
        ],
      },
    },
    {
      event: {
        id: "timeline-test-question",
        title: "Timeline tests",
        body: "Validate that the draft will fit the real onboarding cadence.",
        tone: "question",
      },
      question: {
        id: "timeline-confidence",
        question: "Does the period have enough room for the planned work?",
        reason: "These checks keep the first version realistic before the draft is created.",
        tests: [
          { id: "timeline-start", label: "Start/end dates or period boundaries are clear enough.", checked: false },
          { id: "timeline-load", label: "The first week leaves space for setup, meetings, and review.", checked: false },
        ],
      },
    },
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
