"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User2,
  Briefcase,
  Brain,
  Check,
  ClipboardCheck,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createNewcomer } from "@/services/newcomers";
import {
  generateAssessment,
  publishAssessment,
} from "@/services/assessments";
import { toApiError } from "@/lib/api";
import { useDemo } from "@/providers/demo-provider";

import { AssessmentGeneratorPanel } from "@/components/mentor/assessment/AssessmentGeneratorPanel";
import { AssessmentDraftEditor } from "@/components/mentor/assessment/AssessmentDraftEditor";
import { AssessmentLiveWorkspace } from "@/components/mentor/assessment/AssessmentLiveWorkspace";
import type { Assessment, AssessmentQuestionType, ID } from "@/types";

const formSchema = z.object({
  full_name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  job_title: z.string().min(2, "Required"),
  seniority: z.string().min(1, "Required"),
  team: z.string().min(1, "Required"),
  start_date: z.string().optional(),
  main_goal: z.string().optional(),
  known_skills: z.string().optional(),
  known_gaps: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, label: "Profile", icon: User2, fields: ["full_name", "email"] as const },
  {
    id: 2,
    label: "Role context",
    icon: Briefcase,
    fields: ["job_title", "seniority", "team", "start_date", "main_goal"] as const,
  },
  {
    id: 3,
    label: "Skills & gaps",
    icon: Brain,
    fields: ["known_skills", "known_gaps"] as const,
  },
  { id: 4, label: "Review", icon: ClipboardCheck, fields: [] as const },
];

export default function AddNewcomerPage() {
  const router = useRouter();
  const { mentorId, refreshPersonas, selectPersona, guidedDemoActive } = useDemo();
  const [step, setStep] = React.useState(1);
  const [assessment, setAssessment] = React.useState<Assessment | null>(null);
  const [genMode, setGenMode] = React.useState<"fast" | "live" | null>(null);
  const [showLive, setShowLive] = React.useState(false);
  const [liveInputCache, setLiveInputCache] = React.useState<{
    types: AssessmentQuestionType[];
    count: number;
    notes: string;
    docIds: ID[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      job_title: "Backend Developer",
      seniority: "Middle",
      team: "Payments",
      start_date: "",
      main_goal: "Ship first backend PR within 2 weeks",
      known_skills: "",
      known_gaps: "",
    },
  });

  const generateMut = useMutation({
    mutationFn: generateAssessment,
    onSuccess: (a) => {
      setAssessment(a);
      toast.success("Skill check drafted", {
        description: `${a.questions.length} questions ready to review.`,
      });
    },
    onError: (err) => {
      toast.error("Couldn't generate assessment", {
        description: toApiError(err).message,
      });
    },
    onSettled: () => setGenMode(null),
  });

  const createMut = useMutation({
    mutationFn: createNewcomer,
    onSuccess: async (newcomer) => {
      if (assessment) {
        try {
          await publishAssessment(assessment.id, newcomer.id);
        } catch (err) {
          toast.error("Newcomer added, but couldn't publish assessment", {
            description: toApiError(err).message,
          });
        }
      }
      toast.success("Newcomer added", {
        description: assessment
          ? "Skill check is now live in their dashboard."
          : "Now let's set up their knowledge base.",
      });
      selectPersona(
        {
          role: "newcomer",
          user_id: newcomer.user_id,
          newcomer_id: newcomer.id,
          name: newcomer.full_name ?? `Newcomer #${newcomer.id}`,
          email: newcomer.email ?? "",
          job_title: newcomer.job_title,
          team: newcomer.team,
        },
        { preserveRole: true },
      );
      await refreshPersonas();
      router.push(`/mentor/knowledge?newcomer=${newcomer.id}`);
    },
    onError: (err) => {
      toast.error("Couldn't add newcomer", {
        description: toApiError(err).message,
      });
    },
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    const fields = STEPS[step - 1].fields;
    const valid = await form.trigger(fields as readonly (keyof FormValues)[]);
    return valid;
  };

  const handleNext = async () => {
    if (await validateCurrentStep()) setStep((s) => Math.min(STEPS.length, s + 1));
  };
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = (values: FormValues) => {
    createMut.mutate({
      ...values,
      start_date: values.start_date || null,
      mentor_id: mentorId ?? null,
    });
  };

  const handleGenerate = (
    inputs: {
      mentorNotes: string;
      documentIds: ID[];
      questionTypes: AssessmentQuestionType[];
      questionCount: number;
    },
    mode: "fast" | "live",
  ) => {
    setGenMode(mode);
    if (mode === "live") {
      setLiveInputCache({
        types: inputs.questionTypes,
        count: inputs.questionCount,
        notes: inputs.mentorNotes,
        docIds: inputs.documentIds,
      });
      setShowLive(true);
    }
    const values = form.getValues();
    generateMut.mutate({
      mentor_id: mentorId ?? null,
      mentor_notes: inputs.mentorNotes,
      document_ids: inputs.documentIds,
      question_types: inputs.questionTypes,
      question_count: inputs.questionCount,
      job_title: values.job_title,
      seniority: values.seniority,
      team: values.team,
      known_skills: values.known_skills ?? null,
      known_gaps: values.known_gaps ?? null,
      role_context: values.main_goal ?? null,
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Onboarding setup"
        title="Add a newcomer"
        description="Tell AI who's joining the team - it personalizes the plan and crafts a calibration skill check."
        actions={
          <Button asChild variant="ghost">
            <a href="/mentor">
              <ArrowLeft className="h-4 w-4" /> Back
            </a>
          </Button>
        }
      />

      <Stepper step={step} />

      <Card>
        <CardContent className="p-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            onKeyDown={(e) => {
              if (e.key === "Enter" && step < STEPS.length) {
                e.preventDefault();
                void handleNext();
              }
            }}
          >
            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2" data-demo-id="add-newcomer-profile">
                <Field
                  label="Full name"
                  error={form.formState.errors.full_name?.message}
                >
                  <Input
                    placeholder="Tanya Petrova"
                    data-demo-id="add-newcomer-full-name"
                    {...form.register("full_name")}
                  />
                </Field>
                <Field
                  label="Work email"
                  error={form.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="tanya@company.com"
                    data-demo-id="add-newcomer-email"
                    {...form.register("email")}
                  />
                </Field>
                <p className="sm:col-span-2 text-xs text-[color:var(--color-fg-subtle)]">
                  This profile becomes the basis of the AI-generated onboarding plan.
                  You can edit anything later.
                </p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 sm:grid-cols-2" data-demo-id="add-newcomer-role-context">
                <Field
                  label="Role"
                  error={form.formState.errors.job_title?.message}
                >
                  <Input
                    placeholder="Backend Developer"
                    data-demo-id="add-newcomer-job-title"
                    {...form.register("job_title")}
                  />
                </Field>
                <Field
                  label="Seniority"
                  error={form.formState.errors.seniority?.message}
                >
                  <Controlled
                    name="seniority"
                    form={form}
                    render={(v, set) => (
                      <Select value={v} onValueChange={set}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Middle">Middle</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Staff">Staff</SelectItem>
                          <SelectItem value="Principal">Principal</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field
                  label="Team"
                  error={form.formState.errors.team?.message}
                >
                  <Input
                    placeholder="Payments"
                    data-demo-id="add-newcomer-team"
                    {...form.register("team")}
                  />
                </Field>
                <Field label="Start date">
                  <Input
                    type="date"
                    data-demo-id="add-newcomer-start-date"
                    {...form.register("start_date")}
                  />
                </Field>
                <Field
                  label="Main goal for the first month"
                  className="sm:col-span-2"
                >
                  <Input
                    placeholder="Ship first backend PR within 2 weeks"
                    data-demo-id="add-newcomer-main-goal"
                    {...form.register("main_goal")}
                  />
                </Field>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-5" data-demo-id="add-newcomer-skills">
                <Field
                  label="Known skills"
                  hint="Comma-separated. The AI uses these to deprioritize redundant tasks."
                >
                  <Textarea
                    rows={2}
                    placeholder="Python, PostgreSQL, REST APIs"
                    data-demo-id="add-newcomer-known-skills"
                    {...form.register("known_skills")}
                  />
                </Field>
                <Field
                  label="Known gaps"
                  hint="What you suspect they'll need to learn. AI uses this to seed the right pairing sessions and docs."
                >
                  <Textarea
                    rows={2}
                    placeholder="Deployment, internal architecture"
                    data-demo-id="add-newcomer-known-gaps"
                    {...form.register("known_gaps")}
                  />
                </Field>

                <AssessmentGeneratorPanel
                  initial={{
                    mentorNotes:
                      liveInputCache?.notes ??
                      (guidedDemoActive
                        ? "Keep it short: two practical questions on release workflow and incident handoff."
                        : undefined),
                    documentIds: liveInputCache?.docIds,
                    questionTypes:
                      liveInputCache?.types ?? (guidedDemoActive ? ["short_answer"] : undefined),
                    questionCount: liveInputCache?.count ?? (guidedDemoActive ? 2 : undefined),
                  }}
                  isGenerating={generateMut.isPending}
                  mode={genMode}
                  onGenerate={handleGenerate}
                />

                {assessment ? (
                  <AssessmentDraftEditor
                    assessment={assessment}
                    onChange={setAssessment}
                  />
                ) : null}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4" data-demo-id="add-newcomer-review">
                <ReviewSection title="Profile" onEdit={() => setStep(1)}>
                  <ReviewRow label="Name" value={form.watch("full_name") || "-"} />
                  <ReviewRow label="Email" value={form.watch("email") || "-"} />
                </ReviewSection>
                <ReviewSection title="Role context" onEdit={() => setStep(2)}>
                  <ReviewRow label="Role" value={form.watch("job_title") || "-"} />
                  <ReviewRow label="Seniority" value={form.watch("seniority") || "-"} />
                  <ReviewRow label="Team" value={form.watch("team") || "-"} />
                  <ReviewRow label="Start date" value={form.watch("start_date") || "-"} />
                  <ReviewRow label="Goal" value={form.watch("main_goal") || "-"} />
                </ReviewSection>
                <ReviewSection title="Skills & gaps" onEdit={() => setStep(3)}>
                  <ReviewRow
                    label="Known skills"
                    value={form.watch("known_skills") || "Not specified"}
                  />
                  <ReviewRow
                    label="Known gaps"
                    value={form.watch("known_gaps") || "Not specified"}
                  />
                </ReviewSection>
                <AssessmentReviewSection
                  assessment={assessment}
                  onEdit={() => setStep(3)}
                />
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < STEPS.length ? (
                <Button type="button" onClick={handleNext} data-demo-id="add-newcomer-next">
                  {step === 3 ? "Review newcomer" : "Continue"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createMut.isPending}
                  variant="ai"
                  data-demo-id="add-newcomer-submit"
                >
                  <Sparkles className="h-4 w-4" />
                  {createMut.isPending ? "Adding..." : "Add newcomer"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showLive && liveInputCache ? (
          <AssessmentLiveWorkspace
            input={{
              jobTitle: form.getValues("job_title"),
              seniority: form.getValues("seniority"),
              team: form.getValues("team"),
              mentorNotes: liveInputCache.notes,
              questionCount: liveInputCache.count,
              questionTypes: liveInputCache.types,
              selectedDocumentCount: liveInputCache.docIds.length,
            }}
            onClose={() => setShowLive(false)}
            onDone={() => setShowLive(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 flex-wrap">
      {STEPS.map((s, idx) => {
        const Icon = s.icon;
        const done = step > s.id;
        const active = step === s.id;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors",
                done
                  ? "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)]"
                  : active
                    ? "ai-gradient text-white shadow-sm"
                    : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              <span>
                Step {s.id} / {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 ? (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  done
                    ? "bg-[color:var(--color-primary)]"
                    : "bg-[color:var(--color-border)]",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {hint && !error ? (
        <div className="text-xs text-[color:var(--color-fg-subtle)]">{hint}</div>
      ) : null}
      {error ? (
        <div className="text-xs text-[color:var(--color-danger-fg)]">{error}</div>
      ) : null}
    </div>
  );
}

function ReviewSection({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-lg border border-[color:var(--color-border)] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
          {title}
        </h2>
        <Button type="button" size="sm" variant="ghost" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 text-sm sm:grid-cols-[140px_1fr]">
      <dt className="text-[color:var(--color-fg-subtle)]">{label}</dt>
      <dd className="text-[color:var(--color-fg)]">{value}</dd>
    </div>
  );
}

function AssessmentReviewSection({
  assessment,
  onEdit,
}: {
  assessment: Assessment | null;
  onEdit: () => void;
}) {
  if (!assessment) {
    return (
      <section className="rounded-lg border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            Skill check
          </h2>
          <Button type="button" size="sm" variant="ghost" onClick={onEdit}>
            Edit
          </Button>
        </div>
        <p className="text-xs text-[color:var(--color-fg-muted)]">
          No skill check generated yet. The newcomer will skip the day-1 test if
          you finish without one.
        </p>
      </section>
    );
  }
  const counts: Record<string, number> = {};
  assessment.questions.forEach((q) => {
    counts[q.question_type] = (counts[q.question_type] ?? 0) + 1;
  });
  return (
    <section className="rounded-lg border border-[color:var(--color-border)] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
          Skill check ({assessment.questions.length} questions)
        </h2>
        <Button type="button" size="sm" variant="ghost" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <dl className="space-y-2 text-sm">
        <ReviewRow label="Title" value={assessment.title} />
        <ReviewRow
          label="Mix"
          value={Object.entries(counts)
            .map(([k, v]) => `${v} ${k.replace("_", " ")}`)
            .join(" / ")}
        />
        {assessment.mentor_notes ? (
          <ReviewRow label="Notes" value={assessment.mentor_notes} />
        ) : null}
      </dl>
    </section>
  );
}

function Controlled({
  form,
  name,
  render,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: "seniority";
  render: (value: string, set: (v: string) => void) => React.ReactNode;
}) {
  const value = form.watch(name) ?? "";
  return (
    <>
      {render(String(value), (v) =>
        form.setValue(name, v, { shouldValidate: true }),
      )}
    </>
  );
}
