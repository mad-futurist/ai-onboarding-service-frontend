import type { LiveStreamEvent, Newcomer } from "@/types";

/**
 * Abstraction over plan-generation streaming. Today it runs a client-side
 * simulator (the backend doesn't yet expose SSE). The day FastAPI ships
 * /onboarding-plans/generate-stream, swap the body of `startPlanStream`
 * for a real `EventSource` / `fetch + ReadableStream` reader — the
 * `LiveStreamEvent` shape is already aligned with the proposed SSE events.
 */

export interface StartStreamInput {
  newcomer: Newcomer | undefined;
  periodLabel: string;
  periodGoal: string;
  mentorNotes: string;
  selectedDocumentCount: number;
}

export interface LiveStreamHandle {
  stop(): void;
  pause(): void;
  resume(): void;
  sendAnswer(questionId: string, answer: string): void;
  sendComment(body: string): void;
  isPaused(): boolean;
}

type Listener = (event: LiveStreamEvent) => void;

export function startPlanStream(
  input: StartStreamInput,
  listener: Listener,
): LiveStreamHandle {
  const script = buildScript(input);
  let cursor = 0;
  let paused = false;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const pendingAnswers = new Map<string, (answer: string) => void>();

  const scheduleNext = (delay: number) => {
    if (stopped) return;
    if (paused) return;
    timer = setTimeout(tick, delay);
  };

  const tick = () => {
    if (stopped || paused) return;
    const step = script[cursor];
    if (!step) {
      listener({ type: "done", plan_id: -1, tasks_count: 0 });
      return;
    }
    cursor += 1;

    // Emit any pre-emit events, then schedule the next tick.
    if (step.kind === "events") {
      for (const evt of step.events) listener(evt);
      scheduleNext(step.delay ?? 700);
      return;
    }

    if (step.kind === "thought") {
      streamTokens(step.id, step.text, listener, () => scheduleNext(step.delay ?? 250));
      return;
    }

    if (step.kind === "wait_answer") {
      // Pause the stream until sendAnswer is called for this question id.
      const targetId = step.questionId;
      const done = () => {
        pendingAnswers.delete(targetId);
        scheduleNext(step.delay ?? 400);
      };
      pendingAnswers.set(targetId, done);
      return;
    }

    if (step.kind === "task") {
      // Emit a task scaffold, then "type" its description token by token.
      listener({
        type: "task",
        id: step.id,
        week_index: step.weekIndex,
        title: step.title,
        priority: step.priority,
      });
      streamTokens(`${step.id}-desc`, step.description, (e) => {
        if (e.type === "thinking") {
          listener({
            type: "task",
            id: step.id,
            week_index: step.weekIndex,
            title: step.title,
            description_delta: e.delta,
            done: e.done,
          });
        }
      }, () => scheduleNext(step.delay ?? 350));
      return;
    }
  };

  // Kick off
  scheduleNext(180);

  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
    pause() {
      paused = true;
      if (timer) clearTimeout(timer);
    },
    resume() {
      if (!paused) return;
      paused = false;
      scheduleNext(120);
    },
    isPaused() {
      return paused;
    },
    sendAnswer(questionId, _answer) {
      const resolver = pendingAnswers.get(questionId);
      if (resolver) resolver(_answer);
    },
    sendComment(body) {
      listener({ type: "comment_ack", id: `c-${Date.now()}`, body });
    },
  };
}

/* ---------- token streaming (mimics LLM streaming) ---------- */

function streamTokens(
  id: string,
  text: string,
  listener: Listener,
  onComplete: () => void,
): void {
  const tokens = chunkText(text);
  let i = 0;
  const next = () => {
    if (i >= tokens.length) {
      listener({ type: "thinking", id, delta: "", done: true });
      onComplete();
      return;
    }
    listener({ type: "thinking", id, delta: tokens[i] });
    i += 1;
    setTimeout(next, 18 + Math.random() * 28);
  };
  next();
}

function chunkText(text: string): string[] {
  // split on whitespace boundaries while keeping the spaces
  return text.match(/\S+\s*/g) ?? [text];
}

/* ---------- demo script generator ---------- */

type ScriptStep =
  | { kind: "events"; events: LiveStreamEvent[]; delay?: number }
  | { kind: "thought"; id: string; text: string; delay?: number }
  | { kind: "wait_answer"; questionId: string; delay?: number }
  | {
      kind: "task";
      id: string;
      weekIndex: number;
      title: string;
      description: string;
      priority?: "low" | "medium" | "high";
      delay?: number;
    };

function buildScript(input: StartStreamInput): ScriptStep[] {
  const name = input.newcomer?.full_name?.split(" ")[0] ?? "the newcomer";
  const role = input.newcomer?.job_title ?? "engineer";
  const goal = (input.periodGoal || input.periodLabel || "this period").trim();

  const steps: ScriptStep[] = [
    {
      kind: "events",
      events: [{ type: "phase", phase: "profile", label: "Analyzing the profile" }],
    },
    {
      kind: "thought",
      id: "t-profile",
      text: `Reading ${name}'s profile — ${role}. Period focus: ${goal}.`,
    },
    {
      kind: "events",
      events: [{ type: "phase", phase: "sources", label: "Grounding on sources" }],
    },
    {
      kind: "thought",
      id: "t-sources",
      text: `Scanned ${Math.max(1, input.selectedDocumentCount)} sources, ranking by relevance.`,
    },
    {
      kind: "events",
      events: [
        { type: "source", id: "s1", title: "Deployment runbook", score: 0.94 },
        { type: "source", id: "s2", title: "Code review guide", score: 0.88 },
        { type: "source", id: "s3", title: "Team rituals doc", score: 0.71 },
      ],
      delay: 500,
    },
    {
      kind: "events",
      events: [
        { type: "warning", id: "w1", message: "No infra access policy in your sources — I'll improvise." },
      ],
    },
    {
      kind: "events",
      events: [{ type: "phase", phase: "reasoning", label: "Reasoning the structure" }],
    },
    {
      kind: "thought",
      id: "t-structure",
      text: "Two valid shapes for this period. Asking for your call.",
    },
    {
      kind: "events",
      events: [
        {
          type: "question",
          id: "q1",
          question: `Should ${name} pair with a senior on the 1st prod deployment, or fly solo with a code review?`,
          reason: "Deployment is the weakest area in the profile. Both approaches are defensible.",
          options: ["Pair with senior (safer)", "Solo + thorough review (autonomy)"],
        },
      ],
    },
    { kind: "wait_answer", questionId: "q1" },
    {
      kind: "events",
      events: [{ type: "phase", phase: "drafting", label: "Drafting the weeks" }],
    },
    {
      kind: "events",
      events: [
        { type: "week", index: 1, title: "Setup & first ticket", status: "writing", goal: "Local infra ready, 1st bug fix shipped" },
      ],
    },
    {
      kind: "task",
      id: "tsk-1",
      weekIndex: 1,
      title: "Set up local dev environment",
      description: "Install the toolchain, run the test suite, get a green build by EOD.",
      priority: "high",
    },
    {
      kind: "task",
      id: "tsk-2",
      weekIndex: 1,
      title: "Read codebase overview doc",
      description: "Skim the architecture diagram and the README. Bookmark the data-flow section.",
      priority: "medium",
    },
    {
      kind: "events",
      events: [
        { type: "week", index: 1, title: "Setup & first ticket", status: "ready" },
        { type: "week", index: 2, title: "First independent PR", status: "writing", goal: "Open and merge a non-trivial PR" },
      ],
    },
    {
      kind: "task",
      id: "tsk-3",
      weekIndex: 2,
      title: "Pick a starter ticket",
      description: "Choose one from the `good-first-issue` lane. Scope it with your mentor.",
      priority: "high",
    },
    {
      kind: "task",
      id: "tsk-4",
      weekIndex: 2,
      title: "Pair on deployment",
      description: "Shadow a senior on a small prod deploy. Take notes; you'll redo it solo next week.",
      priority: "medium",
    },
    {
      kind: "events",
      events: [
        { type: "week", index: 2, title: "First independent PR", status: "ready" },
        { type: "phase", phase: "done", label: "Draft ready" },
      ],
    },
  ];

  return steps;
}
