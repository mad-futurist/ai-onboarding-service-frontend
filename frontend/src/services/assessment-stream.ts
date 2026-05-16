import type {
  AssessmentQuestionType,
  AssessmentDifficulty,
  AssessmentOption,
} from "@/types";

/**
 * Client-side simulator for the assessment-generation "live mode".
 * Mirrors the shape that a future backend SSE endpoint would emit, so we can
 * swap the body of `startAssessmentStream` for a real `EventSource` later
 * without changing callers.
 */

export type AssessmentStreamEvent =
  | { type: "phase"; phase: string; label: string }
  | { type: "source"; id: string; title: string; score: number }
  | { type: "warning"; id: string; message: string }
  | {
      type: "question_start";
      tempId: string;
      orderIndex: number;
      questionType: AssessmentQuestionType;
      difficulty: AssessmentDifficulty;
      skillTag: string;
    }
  | { type: "prompt_token"; tempId: string; delta: string; done?: boolean }
  | { type: "option"; tempId: string; option: AssessmentOption }
  | { type: "question_complete"; tempId: string }
  | { type: "done"; assessmentId?: number };

export interface StartAssessmentStreamInput {
  jobTitle?: string | null;
  seniority?: string | null;
  team?: string | null;
  mentorNotes?: string | null;
  questionCount: number;
  questionTypes: AssessmentQuestionType[];
  selectedDocumentCount: number;
}

export interface AssessmentStreamHandle {
  stop(): void;
}

type Listener = (event: AssessmentStreamEvent) => void;

export function startAssessmentStream(
  input: StartAssessmentStreamInput,
  listener: Listener,
): AssessmentStreamHandle {
  let stopped = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  const schedule = (fn: () => void, delay: number) => {
    if (stopped) return;
    const t = setTimeout(() => {
      if (!stopped) fn();
    }, delay);
    timers.push(t);
  };

  const emit = (e: AssessmentStreamEvent) => {
    if (!stopped) listener(e);
  };

  const run = async () => {
    emit({ type: "phase", phase: "profile", label: "Reading role context" });

    schedule(() => {
      emit({ type: "phase", phase: "sources", label: "Grounding on sources" });
      const docs = Math.max(1, input.selectedDocumentCount);
      for (let i = 0; i < Math.min(docs, 3); i++) {
        emit({
          type: "source",
          id: `s${i}`,
          title: `Reference source #${i + 1}`,
          score: 0.92 - i * 0.07,
        });
      }
    }, 600);

    schedule(() => {
      emit({ type: "phase", phase: "drafting", label: "Drafting questions" });
    }, 1200);

    const startAt = 1700;
    const perQuestion = 1800;
    const types = input.questionTypes.length
      ? input.questionTypes
      : (["mcq", "short_answer", "scenario"] as AssessmentQuestionType[]);
    const difficulties: AssessmentDifficulty[] = ["easy", "medium", "hard"];

    for (let i = 0; i < input.questionCount; i++) {
      const tempId = `q-${i}`;
      const qType = types[i % types.length];
      const diff = difficulties[i % difficulties.length];
      const base = startAt + i * perQuestion;

      schedule(() => {
        emit({
          type: "question_start",
          tempId,
          orderIndex: i,
          questionType: qType,
          difficulty: diff,
          skillTag: pickSkillTag(input.jobTitle, i),
        });
      }, base);

      const promptText = buildSamplePrompt(input.jobTitle, qType, i);
      const tokens = chunkText(promptText);
      tokens.forEach((tok, idx) => {
        schedule(() => {
          emit({
            type: "prompt_token",
            tempId,
            delta: tok,
            done: idx === tokens.length - 1,
          });
        }, base + 200 + idx * 35);
      });

      if (qType === "mcq") {
        const opts = buildSampleOptions(input.jobTitle, i);
        opts.forEach((opt, idx) => {
          schedule(() => {
            emit({ type: "option", tempId, option: opt });
          }, base + 200 + tokens.length * 35 + idx * 90);
        });
      }

      schedule(() => {
        emit({ type: "question_complete", tempId });
      }, base + perQuestion - 100);
    }

    schedule(() => {
      emit({ type: "done" });
    }, startAt + input.questionCount * perQuestion + 200);
  };

  void run();

  return {
    stop() {
      stopped = true;
      timers.forEach((t) => clearTimeout(t));
    },
  };
}

function chunkText(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

function pickSkillTag(role: string | null | undefined, idx: number): string {
  const base = (role || "general").toLowerCase().split(" ")[0];
  const tags = [base, "team-communication", "judgment", "ownership", "debugging"];
  return tags[idx % tags.length];
}

function buildSamplePrompt(
  role: string | null | undefined,
  qType: AssessmentQuestionType,
  idx: number,
): string {
  const r = role || "team member";
  const samples: Record<AssessmentQuestionType, string[]> = {
    mcq: [
      `As a new ${r}, what is the best first step on day 1?`,
      `Which approach helps you understand a new codebase fastest?`,
      `When facing conflicting advice from two seniors, you should…`,
    ],
    short_answer: [
      `In two sentences, how do you ask for help when blocked?`,
      `Describe one good question for your first 1:1 with your mentor.`,
      `What does a good code review comment look like?`,
    ],
    scenario: [
      `You spot a small bug in production on day 3. Walk through how you'd respond.`,
      `Your mentor is unavailable for a week. How do you stay unblocked?`,
      `You disagree with a teammate's technical decision. How do you handle it?`,
    ],
  };
  const list = samples[qType];
  return list[idx % list.length];
}

function buildSampleOptions(
  _role: string | null | undefined,
  idx: number,
): AssessmentOption[] {
  const bank: AssessmentOption[][] = [
    [
      { id: "a", label: "Start writing code right away", is_correct: false },
      { id: "b", label: "Meet your mentor and align on goals", is_correct: true },
      { id: "c", label: "Refactor an old module", is_correct: false },
      { id: "d", label: "Wait to be told what to do", is_correct: false },
    ],
    [
      { id: "a", label: "Read every file from A to Z", is_correct: false },
      { id: "b", label: "Trace a user-facing flow end-to-end", is_correct: true },
      { id: "c", label: "Only read tests", is_correct: false },
      { id: "d", label: "Rewrite the parts you don't get", is_correct: false },
    ],
    [
      { id: "a", label: "Pick the senior with more tenure", is_correct: false },
      { id: "b", label: "Summarize both, surface the conflict openly, ask for criteria", is_correct: true },
      { id: "c", label: "Quietly do whatever seems easier", is_correct: false },
      { id: "d", label: "Escalate to your manager", is_correct: false },
    ],
  ];
  return bank[idx % bank.length];
}
