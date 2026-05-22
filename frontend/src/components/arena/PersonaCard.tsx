"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Lock, Swords, Zap, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ArenaScenario } from "@/types";

const CONVERSATION_LABEL: Record<string, string> = {
  discovery: "Discovery",
  objection_handling: "Objections",
  closing: "Closing",
  technical: "Technical",
};

const CONVERSATION_ACCENT: Record<string, string> = {
  discovery: "from-sky-500/15 to-emerald-500/10",
  objection_handling: "from-orange-500/15 to-amber-500/10",
  closing: "from-violet-500/15 to-fuchsia-500/10",
  technical: "from-cyan-500/15 to-indigo-500/10",
};

function DifficultyDots({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < value
              ? "bg-[color:var(--color-primary)]"
              : "bg-[color:var(--color-border)]",
          )}
        />
      ))}
    </div>
  );
}

interface PersonaCardProps {
  scenario: ArenaScenario;
  onEnter: () => void;
}

export function PersonaCard({ scenario, onEnter }: PersonaCardProps) {
  const locked = !!scenario.locked && !scenario.is_personal_bot;
  const accent = CONVERSATION_ACCENT[scenario.conversation_type] ?? CONVERSATION_ACCENT.discovery;
  const scenarioSlug = slugifyScenarioTitle(scenario.title);

  return (
    <motion.div
      whileHover={{ y: locked ? 0 : -4, scale: locked ? 1 : 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      data-demo-id={`arena-scenario-${scenarioSlug}`}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)]",
        locked && "opacity-80",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b",
          accent,
        )}
      />
      {scenario.is_personal_bot ? (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
          <Sparkles className="h-3 w-3" /> Personal
        </div>
      ) : null}

      <div className="relative p-5 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-surface)] text-2xl shadow ring-1 ring-[color:var(--color-border)]">
            {scenario.cover_emoji ?? (scenario.is_personal_bot ? "🤖" : "🎯")}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight text-[color:var(--color-fg)]">
              {scenario.title}
            </h3>
            <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
              {scenario.persona.name} · {scenario.persona.role ?? ""}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[color:var(--color-fg-muted)]">
            <Zap className="h-3 w-3" />
            {CONVERSATION_LABEL[scenario.conversation_type] ?? "Practice"}
          </span>
          <DifficultyDots value={scenario.difficulty} />
        </div>

        {scenario.description ? (
          <p className="mt-3 line-clamp-2 text-xs text-[color:var(--color-fg-muted)]">
            {scenario.description}
          </p>
        ) : null}
      </div>

      <div className="relative border-t border-[color:var(--color-border)] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[color:var(--color-fg-muted)]">
            {scenario.attempts ? (
              <span>
                {scenario.attempts} attempt{scenario.attempts === 1 ? "" : "s"}
                {scenario.last_score != null
                  ? ` · last ${Math.round(scenario.last_score)}`
                  : ""}
              </span>
            ) : (
              <span>Never played</span>
            )}
          </div>
          {locked ? (
            <Button size="sm" variant="ghost" disabled className="gap-1">
              <Lock className="h-3.5 w-3.5" /> Locked
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ai"
              onClick={onEnter}
              className="gap-1.5"
              data-demo-id={`arena-enter-${scenarioSlug}`}
            >
              <Swords className="h-3.5 w-3.5" />
              Enter Arena
            </Button>
          )}
        </div>
      </div>

      {locked ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[color:var(--color-bg)]/30 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs text-[color:var(--color-fg-muted)] shadow">
            <Lock className="h-3.5 w-3.5" /> Clear lower difficulty first
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

function slugifyScenarioTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
