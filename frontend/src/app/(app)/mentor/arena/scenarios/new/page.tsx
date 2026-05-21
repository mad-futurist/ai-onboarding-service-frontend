"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createArenaScenario } from "@/services/arena";
import { useDemo } from "@/providers/demo-provider";
import type { ArenaConversationType } from "@/types";

const CONVERSATION_OPTIONS: { value: ArenaConversationType; label: string }[] = [
  { value: "discovery", label: "Discovery" },
  { value: "objection_handling", label: "Objection handling" },
  { value: "closing", label: "Closing" },
  { value: "technical", label: "Technical" },
];

const EMOJI_BANK = ["🎯", "💼", "💸", "🧠", "📦", "🛡️", "🚀", "⚡", "🔍", "📞"];

export default function NewScenarioPage() {
  const router = useRouter();
  const { mentorId, personas } = useDemo();

  const [title, setTitle] = React.useState("Skeptical CFO");
  const [conversationType, setConversationType] =
    React.useState<ArenaConversationType>("discovery");
  const [difficulty, setDifficulty] = React.useState(3);
  const [emoji, setEmoji] = React.useState("🎯");
  const [description, setDescription] = React.useState(
    "Senior finance buyer who tests every ROI claim.",
  );
  const [goal, setGoal] = React.useState(
    "Earn a 30-minute follow-up call where pricing is on the table.",
  );
  const [criteria, setCriteria] = React.useState(
    "Discover at least 2 concrete pains\nName one quantifiable success metric\nSecure a follow-up date",
  );
  const [audience, setAudience] = React.useState<number | "all">("all");
  const [liveCoaching, setLiveCoaching] = React.useState(true);

  // Persona
  const [personaName, setPersonaName] = React.useState("Robert Lin");
  const [personaRole, setPersonaRole] = React.useState("CFO");
  const [personaCompany, setPersonaCompany] = React.useState("Northridge Logistics");
  const [traits, setTraits] = React.useState("skeptical, data-driven, short on time");
  const [hiddenAgenda, setHiddenAgenda] = React.useState(
    "Has been burned by a prior vendor and needs political cover to approve another contract.",
  );
  const [emotionalState, setEmotionalState] = React.useState("guarded");
  const [voiceNotes, setVoiceNotes] = React.useState(
    "Short sentences. Interrupts when buzzwords appear.",
  );
  const [petPeeves, setPetPeeves] = React.useState(
    "vague promises, vendor jargon",
  );

  const newcomerPersonas = personas.filter((p) => p.role === "newcomer" && p.newcomer_id);

  const createMut = useMutation({
    mutationFn: () => {
      return createArenaScenario({
        mentor_id: mentorId ?? null,
        audience_newcomer_id: audience === "all" ? null : audience,
        title,
        conversation_type: conversationType,
        difficulty,
        persona: {
          name: personaName,
          role: personaRole,
          company: personaCompany,
          traits: traits
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          hidden_agenda: hiddenAgenda,
          emotional_state: emotionalState,
          voice_notes: voiceNotes,
          pet_peeves: petPeeves
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
        goal_text: goal,
        success_criteria: criteria
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        kb_source_ids: [],
        allow_live_coaching: liveCoaching,
        description,
        cover_emoji: emoji,
      });
    },
    onSuccess: () => {
      router.push("/mentor/arena");
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 -mb-2">
        <Link href="/mentor/arena">
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
      </Button>

      <PageHeader
        eyebrow="Customer Training Arena"
        title="New scenario"
        description="Design a persona. Set the goal. Publish to one newcomer or the whole team."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Conversation type">
              <div className="flex flex-wrap gap-2">
                {CONVERSATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setConversationType(opt.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      conversationType === opt.value
                        ? "border-transparent bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                        : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-muted)]",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Difficulty">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="w-full"
                />
                <span className="tabular-nums text-sm font-semibold">{difficulty}/5</span>
              </div>
            </Field>
            <Field label="Cover emoji">
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_BANK.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={cn(
                      "h-9 w-9 rounded-lg border text-lg",
                      emoji === e
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]"
                        : "border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)]",
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Short description (shown on lobby card)">
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field label="Session goal">
              <Textarea rows={2} value={goal} onChange={(e) => setGoal(e.target.value)} />
            </Field>
            <Field label="Success criteria (one per line)">
              <Textarea
                rows={3}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              />
            </Field>
            <Field label="Audience">
              <select
                className="h-10 w-full rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3 text-sm"
                value={audience === "all" ? "all" : String(audience)}
                onChange={(e) =>
                  setAudience(e.target.value === "all" ? "all" : Number(e.target.value))
                }
              >
                <option value="all">All newcomers</option>
                {newcomerPersonas.map((p) => (
                  <option key={p.newcomer_id ?? 0} value={String(p.newcomer_id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Allow mentor live coaching">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={liveCoaching}
                  onChange={(e) => setLiveCoaching(e.target.checked)}
                  className="h-4 w-4"
                />
                Mentor can send flash hints during the session
              </label>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Persona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Name">
              <Input value={personaName} onChange={(e) => setPersonaName(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <Input value={personaRole} onChange={(e) => setPersonaRole(e.target.value)} />
              </Field>
              <Field label="Company">
                <Input
                  value={personaCompany}
                  onChange={(e) => setPersonaCompany(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Traits (comma-separated)">
              <Input value={traits} onChange={(e) => setTraits(e.target.value)} />
            </Field>
            <Field label="Hidden agenda (never revealed directly)">
              <Textarea
                rows={2}
                value={hiddenAgenda}
                onChange={(e) => setHiddenAgenda(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Emotional state">
                <Input
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(e.target.value)}
                />
              </Field>
              <Field label="Pet peeves (comma-separated)">
                <Input value={petPeeves} onChange={(e) => setPetPeeves(e.target.value)} />
              </Field>
            </div>
            <Field label="Voice notes (how they speak)">
              <Textarea
                rows={2}
                value={voiceNotes}
                onChange={(e) => setVoiceNotes(e.target.value)}
              />
            </Field>

            <div className="flex justify-end pt-3">
              <Button
                variant="ai"
                onClick={() => createMut.mutate()}
                disabled={createMut.isPending || !title.trim() || !personaName.trim()}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {createMut.isPending ? "Publishing…" : "Publish to Arena"}
              </Button>
            </div>
            {createMut.isError ? (
              <p className="text-xs text-rose-700">
                Could not publish scenario. Check backend logs.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
