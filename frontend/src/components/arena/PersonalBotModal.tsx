"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Wand2,
  AlertCircle,
  FileText,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import {
  createPersonalBotFromSpec,
  getPersonalBotSuggestions,
  listKbOptions,
  previewPersonalBot,
  startArenaSession,
} from "@/services/arena";
import { cn } from "@/lib/utils";
import type {
  ArenaConversationType,
  ArenaRadarDimension,
  ID,
  PersonalBotSpec,
  PersonalBotSuggestions,
} from "@/types";

interface PersonalBotModalProps {
  open: boolean;
  onClose: () => void;
  newcomerId: ID;
  onScenarioReady?: (scenarioId: ID) => void;
}

type Stage = "brief" | "docs" | "building" | "edit";

const DIMENSIONS: { value: ArenaRadarDimension; label: string }[] = [
  { value: "opening", label: "Opening" },
  { value: "discovery", label: "Discovery" },
  { value: "objections", label: "Objections" },
  { value: "closing", label: "Closing" },
  { value: "product_knowledge", label: "Product Knowledge" },
];

const CONVERSATION_TYPES: ArenaConversationType[] = [
  "discovery",
  "objection_handling",
  "closing",
  "technical",
];

const BUILD_PHASES = [
  { phase: "reading", label: "Reading your last sessions" },
  { phase: "mining", label: "Mining your weak spots" },
  { phase: "forging", label: "Forging persona traits" },
  { phase: "polishing", label: "Polishing the brief" },
];

export function PersonalBotModal({
  open,
  onClose,
  newcomerId,
  onScenarioReady,
}: PersonalBotModalProps) {
  const router = useRouter();
  const [stage, setStage] = React.useState<Stage>("brief");
  const [pain, setPain] = React.useState("");
  const [focus, setFocus] = React.useState<ArenaRadarDimension[]>([]);
  const [selectedDocIds, setSelectedDocIds] = React.useState<Set<ID>>(new Set());
  const [spec, setSpec] = React.useState<PersonalBotSpec | null>(null);
  const [buildIdx, setBuildIdx] = React.useState(0);
  const [suggestionsApplied, setSuggestionsApplied] = React.useState(false);

  const suggestionsQ = useQuery({
    queryKey: ["arena", "bot-suggestions", newcomerId],
    queryFn: () => getPersonalBotSuggestions(newcomerId),
    enabled: open && !!newcomerId,
  });

  const docsQ = useQuery({
    queryKey: ["arena", "kb-options"],
    queryFn: () => listKbOptions(),
    enabled: open,
  });

  // Apply suggestions once they arrive (if user hasn't touched focus yet)
  React.useEffect(() => {
    if (
      open &&
      !suggestionsApplied &&
      suggestionsQ.data &&
      focus.length === 0 &&
      suggestionsQ.data.focus_dimensions.length
    ) {
      const nextFocus = suggestionsQ.data.focus_dimensions.slice(0, 3);
      const timer = window.setTimeout(() => {
        setFocus(nextFocus);
        setSuggestionsApplied(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [open, suggestionsApplied, suggestionsQ.data, focus.length]);

  // Auto-select up to 5 documents on first load
  React.useEffect(() => {
    if (open && docsQ.data && selectedDocIds.size === 0) {
      const nextSelected = new Set(docsQ.data.slice(0, 5).map((d) => d.id));
      const timer = window.setTimeout(() => {
        setSelectedDocIds(nextSelected);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, docsQ.data]);

  React.useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(() => {
        setStage("brief");
        setPain("");
        setFocus([]);
        setSelectedDocIds(new Set());
        setSpec(null);
        setBuildIdx(0);
        setSuggestionsApplied(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const previewMut = useMutation({
    mutationFn: () =>
      previewPersonalBot({
        newcomer_id: newcomerId,
        focus_dimensions: focus,
        pain_text: pain,
        source_ids: Array.from(selectedDocIds),
      }),
    onSuccess: (s) => {
      setSpec(s);
      setStage("edit");
    },
    onError: () => {
      setStage("brief");
    },
  });

  const persistMut = useMutation({
    mutationFn: async () => {
      if (!spec) throw new Error("no spec");
      const scenario = await createPersonalBotFromSpec({
        newcomer_id: newcomerId,
        spec,
        source_ids: Array.from(selectedDocIds),
      });
      const session = await startArenaSession(scenario.id, newcomerId);
      return { scenario, session };
    },
    onSuccess: ({ scenario, session }) => {
      onScenarioReady?.(scenario.id);
      router.push(`/newcomer/arena/session/${session.id}`);
      onClose();
    },
  });

  // Build-stage phase tick
  React.useEffect(() => {
    if (stage !== "building") return;
    const resetTimer = window.setTimeout(() => {
      setBuildIdx(0);
    }, 0);
    const interval = window.setInterval(() => {
      setBuildIdx((i) => Math.min(BUILD_PHASES.length - 1, i + 1));
    }, 900);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearInterval(interval);
    };
  }, [stage]);

  const toggleFocus = (dim: ArenaRadarDimension) => {
    setFocus((current) =>
      current.includes(dim)
        ? current.filter((d) => d !== dim)
        : current.length < 3
          ? [...current, dim]
          : current,
    );
  };

  const toggleDoc = (id: ID) => {
    setSelectedDocIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startBuild = () => {
    setStage("building");
    previewMut.mutate();
  };

  const regenerate = () => {
    setStage("building");
    previewMut.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="relative max-w-3xl overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0">
            <AuroraBackground intensity="subtle" />
          </div>
          <div className="relative z-10 p-6">
            <AnimatePresence mode="wait">
              {stage === "brief" ? (
                <StageBrief
                  key="brief"
                  suggestions={suggestionsQ.data ?? null}
                  loadingSuggestions={suggestionsQ.isLoading}
                  pain={pain}
                  setPain={setPain}
                  focus={focus}
                  toggleFocus={toggleFocus}
                  onCancel={onClose}
                  onNext={() => setStage("docs")}
                />
              ) : null}

              {stage === "docs" ? (
                <StageDocs
                  key="docs"
                  docs={docsQ.data ?? []}
                  loading={docsQ.isLoading}
                  selected={selectedDocIds}
                  toggleDoc={toggleDoc}
                  onBack={() => setStage("brief")}
                  onBuild={startBuild}
                />
              ) : null}

              {stage === "building" ? (
                <StageBuilding
                  key="building"
                  phase={BUILD_PHASES[buildIdx]}
                  buildIdx={buildIdx}
                  total={BUILD_PHASES.length}
                />
              ) : null}

              {stage === "edit" && spec ? (
                <StageEdit
                  key="edit"
                  spec={spec}
                  onChange={setSpec}
                  onRegenerate={regenerate}
                  onBack={() => setStage("docs")}
                  onPublish={() => persistMut.mutate()}
                  publishing={persistMut.isPending}
                  error={persistMut.isError}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Stage 1 — Brief with signal-driven suggestions

function StageBrief({
  suggestions,
  loadingSuggestions,
  pain,
  setPain,
  focus,
  toggleFocus,
  onCancel,
  onNext,
}: {
  suggestions: PersonalBotSuggestions | null;
  loadingSuggestions: boolean;
  pain: string;
  setPain: (v: string) => void;
  focus: ArenaRadarDimension[];
  toggleFocus: (d: ArenaRadarDimension) => void;
  onCancel: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-[color:var(--color-primary)]" />
          Forge a Personal Bot
        </DialogTitle>
        <DialogDescription>
          The AI looks at your recent sessions and signals, then designs a client persona engineered
          to push exactly where you&rsquo;re weak. You decide what to feed it.
        </DialogDescription>
      </DialogHeader>

      {loadingSuggestions ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : suggestions ? (
        <div className="mt-4 space-y-3">
          {suggestions.open_arena_signals.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                <AlertCircle className="h-3 w-3" />
                Live signals about you
              </div>
              <ul className="mt-1 space-y-1">
                {suggestions.open_arena_signals.slice(0, 3).map((s) => (
                  <li key={s.id} className="text-[12.5px] leading-snug">
                    <span className="font-medium">{s.title}</span>
                    <span className="text-[11px] text-amber-700"> · {s.occurrence_count}×</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
              AI-recommended focus
            </div>
            <p className="mt-0.5 text-[11px] text-[color:var(--color-fg-subtle)]">
              Picked from your radar averages + open signals. Toggle to override.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIMENSIONS.map((dim) => {
                const active = focus.includes(dim.value);
                const recommended = suggestions.focus_dimensions.includes(dim.value);
                return (
                  <button
                    key={dim.value}
                    onClick={() => toggleFocus(dim.value)}
                    className={cn(
                      "relative rounded-full border px-3 py-1 text-xs transition-all",
                      active
                        ? "border-transparent bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                        : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-muted)]",
                    )}
                  >
                    {recommended ? (
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                    ) : null}
                    {dim.label}
                  </button>
                );
              })}
            </div>
          </div>

          {suggestions.reasons.length ? (
            <div className="rounded-lg bg-[color:var(--color-surface-muted)] p-3 text-[12px] text-[color:var(--color-fg-muted)]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                Why these?
              </div>
              <ul className="mt-1 space-y-1">
                {suggestions.reasons.slice(0, 3).map((r, i) => (
                  <li key={i} className="leading-snug">
                    <span className="font-medium text-[color:var(--color-fg)]">
                      {r.dimension.replace("_", " ")}
                    </span>{" "}
                    — {r.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
          What do you struggle with? (optional)
        </div>
        <Textarea
          value={pain}
          onChange={(e) => setPain(e.target.value)}
          rows={2}
          placeholder="e.g. I freeze when buyers push back on pricing."
          className="mt-2"
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="ai" onClick={onNext} disabled={focus.length === 0} className="gap-1.5">
          Next: pick sources <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stage 2 — Docs picker (real client transcripts, price lists, etc.)

function StageDocs({
  docs,
  loading,
  selected,
  toggleDoc,
  onBack,
  onBuild,
}: {
  docs: { id: ID; title: string; domain: string | null; document_type: string | null; preview: string }[];
  loading: boolean;
  selected: Set<ID>;
  toggleDoc: (id: ID) => void;
  onBack: () => void;
  onBuild: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[color:var(--color-primary)]" />
          Sources to mine
        </DialogTitle>
        <DialogDescription>
          The bot will draw on these documents — real anonymized client transcripts, price lists,
          and product docs — to ground its objections and questions. No authentication, no PII.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 max-h-[340px] space-y-1.5 overflow-y-auto pr-2">
        {loading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : docs.length === 0 ? (
          <p className="py-4 text-center text-sm text-[color:var(--color-fg-muted)]">
            No KB documents loaded yet. Your mentor can upload them in Knowledge.
          </p>
        ) : (
          docs.map((doc) => {
            const active = selected.has(doc.id);
            return (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-2.5 text-left transition-colors",
                  active
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]"
                    : "border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    active
                      ? "border-transparent bg-[color:var(--color-primary)] text-white"
                      : "border-[color:var(--color-border-strong)] bg-white",
                  )}
                >
                  {active ? <CheckCircle2 className="h-3 w-3" /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-fg)]">
                    <span className="truncate">{doc.title}</span>
                    {doc.document_type ? (
                      <span className="rounded-full bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                        {doc.document_type}
                      </span>
                    ) : null}
                  </div>
                  {doc.preview ? (
                    <div className="mt-0.5 line-clamp-1 text-[11.5px] text-[color:var(--color-fg-muted)]">
                      {doc.preview}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-2 text-[11px] text-[color:var(--color-fg-subtle)]">
        {selected.size} source{selected.size === 1 ? "" : "s"} selected
      </div>

      <div className="mt-4 flex justify-between gap-2">
        <Button variant="ghost" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <Button variant="ai" onClick={onBuild} className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Build my bot
        </Button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stage 3 — Live building animation

function StageBuilding({
  phase,
  buildIdx,
  total,
}: {
  phase: { phase: string; label: string };
  buildIdx: number;
  total: number;
}) {
  const pct = Math.round(((buildIdx + 1) / total) * 95);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[320px] flex-col items-center justify-center gap-5 py-8 text-center"
    >
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="var(--color-border)"
            strokeWidth="6"
            fill="none"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            stroke="var(--color-primary)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            animate={{
              strokeDashoffset: 2 * Math.PI * 44 * (1 - pct / 100),
            }}
            transition={{ type: "spring", stiffness: 80, damping: 22 }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums">
          {pct}%
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-base font-semibold">Forging your bot</div>
        <motion.div
          key={phase.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-[color:var(--color-fg-muted)]"
        >
          {phase.label}…
        </motion.div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stage 4 — Edit & publish

function StageEdit({
  spec,
  onChange,
  onRegenerate,
  onBack,
  onPublish,
  publishing,
  error,
}: {
  spec: PersonalBotSpec;
  onChange: (next: PersonalBotSpec) => void;
  onRegenerate: () => void;
  onBack: () => void;
  onPublish: () => void;
  publishing: boolean;
  error: boolean;
}) {
  const update = <K extends keyof PersonalBotSpec>(key: K, value: PersonalBotSpec[K]) =>
    onChange({ ...spec, [key]: value });
  const updatePersona = <K extends keyof PersonalBotSpec["persona"]>(
    key: K,
    value: PersonalBotSpec["persona"][K],
  ) => onChange({ ...spec, persona: { ...spec.persona, [key]: value } });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[color:var(--color-primary)]" />
          Tune the bot
        </DialogTitle>
        <DialogDescription>
          Edit anything before publishing. Or regenerate if it&rsquo;s off.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 grid max-h-[420px] gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
        <SpecField label="Title">
          <Input value={spec.title} onChange={(e) => update("title", e.target.value)} />
        </SpecField>
        <SpecField label="Difficulty (3-5)">
          <Input
            type="number"
            min={3}
            max={5}
            value={spec.difficulty}
            onChange={(e) =>
              update("difficulty", Math.min(5, Math.max(3, Number(e.target.value) || 3)))
            }
          />
        </SpecField>
        <SpecField label="Conversation type">
          <select
            className="h-10 w-full rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3 text-sm"
            value={spec.conversation_type}
            onChange={(e) => update("conversation_type", e.target.value as ArenaConversationType)}
          >
            {CONVERSATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </SpecField>
        <SpecField label="Cover emoji">
          <Input
            maxLength={6}
            value={spec.cover_emoji ?? ""}
            onChange={(e) => update("cover_emoji", e.target.value)}
          />
        </SpecField>
        <SpecField label="Persona name" full>
          <Input value={spec.persona.name} onChange={(e) => updatePersona("name", e.target.value)} />
        </SpecField>
        <SpecField label="Role">
          <Input
            value={spec.persona.role ?? ""}
            onChange={(e) => updatePersona("role", e.target.value)}
          />
        </SpecField>
        <SpecField label="Company">
          <Input
            value={spec.persona.company ?? ""}
            onChange={(e) => updatePersona("company", e.target.value)}
          />
        </SpecField>
        <SpecField label="Traits (comma separated)" full>
          <Input
            value={(spec.persona.traits ?? []).join(", ")}
            onChange={(e) =>
              updatePersona(
                "traits",
                e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              )
            }
          />
        </SpecField>
        <SpecField label="Description" full>
          <Textarea
            rows={2}
            value={spec.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
          />
        </SpecField>
        <SpecField label="Session goal" full>
          <Textarea
            rows={2}
            value={spec.goal_text ?? ""}
            onChange={(e) => update("goal_text", e.target.value)}
          />
        </SpecField>
        <SpecField label="Hidden agenda" full>
          <Textarea
            rows={2}
            value={spec.persona.hidden_agenda ?? ""}
            onChange={(e) => updatePersona("hidden_agenda", e.target.value)}
          />
        </SpecField>
        <SpecField label="Success criteria (one per line)" full>
          <Textarea
            rows={3}
            value={(spec.success_criteria ?? []).join("\n")}
            onChange={(e) =>
              update(
                "success_criteria",
                e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
              )
            }
          />
        </SpecField>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-rose-600">Could not publish — please retry.</p>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-between gap-2">
        <Button variant="ghost" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Sources
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRegenerate} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
          </Button>
          <Button variant="ai" onClick={onPublish} disabled={publishing}>
            {publishing ? "Publishing…" : "Publish & play"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function SpecField({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block space-y-1", full && "sm:col-span-2")}>
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
