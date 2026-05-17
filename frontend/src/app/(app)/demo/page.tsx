"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  GitBranch,
  MessagesSquare,
  MousePointerClick,
  Network,
  PlayCircle,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { cn } from "@/lib/utils";

import { useDemo } from "@/providers/demo-provider";

interface Scene {
  id: number;
  title: string;
  message: string;
  outcome: string;
  links: { label: string; href: string; role: "mentor" | "newcomer" }[];
  icon: React.ComponentType<{ className?: string }>;
}

const SCENES: Scene[] = [
  {
    id: 1,
    title: "Mentor cockpit starts the story",
    message:
      "Oleg opens the dashboard and sees progress, attention signals, today's focus, mentor moves, and saved time without digging through tabs.",
    outcome: "Establishes the operating center.",
    links: [{ label: "Mentor cockpit", href: "/mentor", role: "mentor" }],
    icon: Activity,
  },
  {
    id: 2,
    title: "Newcomer setup captures context",
    message:
      "The mentor adds profile, role, strengths, gaps, and an optional day-1 skill check so AI starts from a real brief.",
    outcome: "Personalization before plan generation.",
    links: [
      { label: "Add newcomer", href: "/mentor/newcomers/new", role: "mentor" },
      { label: "Skill check setup", href: "/mentor/newcomers/new", role: "mentor" },
    ],
    icon: ClipboardCheck,
  },
  {
    id: 3,
    title: "Knowledge base grounds everything",
    message:
      "Company docs become reusable sources for plans, answers, assessments, lessons, and source citations.",
    outcome: "No generic chatbot answers.",
    links: [{ label: "Knowledge base", href: "/mentor/knowledge", role: "mentor" }],
    icon: BookOpen,
  },
  {
    id: 4,
    title: "AI builds the journey",
    message:
      "Oleg generates onboarding period by period, selects sources, chooses fast or live mode, and reviews before approving.",
    outcome: "A 30/60/90 journey becomes editable work.",
    links: [{ label: "AI Plan Generator", href: "/mentor/plan-generator", role: "mentor" }],
    icon: Wand2,
  },
  {
    id: 5,
    title: "Courses turn docs into learning",
    message:
      "AI drafts mini-courses and lessons from selected sources. The mentor reviews, approves, and publishes them to newcomers.",
    outcome: "Learning is structured, not scattered.",
    links: [
      { label: "Courses", href: "/mentor/courses", role: "mentor" },
      { label: "New course", href: "/mentor/courses/new", role: "mentor" },
    ],
    icon: GraduationCap,
  },
  {
    id: 6,
    title: "AI detects friction early",
    message:
      "Signals surface repeated questions, blocked tasks, source friction, code review patterns, fast wins, and suggested next actions.",
    outcome: "Mentor intervenes before the newcomer escalates.",
    links: [{ label: "Signals center", href: "/mentor/signals", role: "mentor" }],
    icon: Network,
  },
  {
    id: 7,
    title: "Meetings and plan adjustments close the loop",
    message:
      "From a signal, the mentor can schedule support, adapt the plan, or spin up a targeted course.",
    outcome: "AI proposes, humans decide.",
    links: [
      { label: "Calendar", href: "/mentor/meetings", role: "mentor" },
      { label: "Plan adjustments", href: "/mentor/signals", role: "mentor" },
    ],
    icon: CalendarDays,
  },
  {
    id: 8,
    title: "Newcomer gets only what matters today",
    message:
      "Marina or Tanya sees today's work, recommended docs, people to know, assessments, courses, and Ask AI with clickable sources.",
    outcome: "The experience feels focused, not overwhelming.",
    links: [
      { label: "Newcomer home", href: "/newcomer", role: "newcomer" },
      { label: "Ask AI", href: "/newcomer/ask", role: "newcomer" },
      { label: "Assessment", href: "/newcomer/assessment", role: "newcomer" },
    ],
    icon: MessagesSquare,
  },
  {
    id: 9,
    title: "Progress is visible to both sides",
    message:
      "The newcomer tracks progress and the mentor sees cohort health, creating a shared source of truth for onboarding.",
    outcome: "No one has to guess where onboarding stands.",
    links: [
      { label: "Progress", href: "/newcomer/progress", role: "newcomer" },
      { label: "My plan", href: "/newcomer/plan", role: "newcomer" },
    ],
    icon: GitBranch,
  },
];

const SHOWCASE = [
  "Auto role switching",
  "Source-grounded answers",
  "AI plan periods",
  "Live generation flow",
  "Skill checks",
  "Course authoring",
  "Signals with evidence",
  "Meetings and adjustments",
];

export default function DemoPage() {
  const router = useRouter();
  const {
    setRole,
    newcomerId,
    guidedDemoActive,
    startGuidedDemo,
    stopGuidedDemo,
  } = useDemo();

  const go = (href: string, role: "mentor" | "newcomer") => {
    setRole(role);
    let target = href;
    if (href === "/mentor/newcomers" && newcomerId) {
      target = `/mentor/newcomers/${newcomerId}`;
    }
    router.push(target);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Demo scenario"
        title={
          <>
            Show the full <span className="ai-gradient-text">AI onboarding</span> loop
          </>
        }
        description="A richer demo path for the current product: mentor setup, grounded knowledge, plan generation, courses, signals, meetings, and the newcomer workspace."
        actions={
          <Button asChild variant="outline">
            <Link href="/mentor">Back to dashboard</Link>
          </Button>
        }
      />

      <section className="relative overflow-hidden rounded-[20px] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="pointer-events-none absolute inset-0 ai-gradient-soft opacity-45" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary-ring)] bg-white/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
              <MousePointerClick className="h-3.5 w-3.5" /> Guided walkthrough
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-fg)]">
              Demo mode points, fills, clicks, and moves.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              Use it during a pitch when you want the app to guide the room: spotlight overlays dim the rest of the UI, arrows pulse on the next control, safe buttons auto-click, and form fields fill with demo data.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SHOWCASE.map((item) => (
                <Badge key={item} tone="ai" size="sm">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          <div
            className="rounded-[16px] border border-[color:var(--color-primary-ring)] bg-white/85 p-4 shadow-[var(--shadow-card)] backdrop-blur"
            data-demo-id="demo-tour-start"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ai-gradient text-white shadow-[var(--shadow-ai)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[color:var(--color-fg)]">
                  {guidedDemoActive ? "Demo mode is running" : "Start the guided mode"}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
                  The tour is safe: it avoids final submit/generate actions that would create or mutate important records.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {guidedDemoActive ? (
                <Button type="button" variant="outline" onClick={stopGuidedDemo}>
                  <X className="h-4 w-4" /> Stop demo mode
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ai"
                  onClick={startGuidedDemo}
                  data-demo-id="demo-tour-start"
                  className="shadow-[var(--shadow-ai)]"
                >
                  <PlayCircle className="h-4 w-4" /> Start demo mode
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => go("/mentor", "mentor")}>
                Manual path <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AIInsightCard
        title="The product story"
        description="ReadySet.AI is not only Ask AI. It creates the work, teaches through sources, detects friction, proposes interventions, and keeps the mentor in control."
        tone="soft"
      />

      <ol className="grid gap-4 lg:grid-cols-2">
        {SCENES.map((scene) => {
          const Icon = scene.icon;
          return (
            <li key={scene.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ai-gradient text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand" size="sm">
                          Scene {scene.id}
                        </Badge>
                        <CardTitle className="text-base">{scene.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-1">{scene.message}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/45 px-3 py-2 text-xs text-[color:var(--color-fg-muted)]">
                    <span className="font-medium text-[color:var(--color-fg)]">Show: </span>
                    {scene.outcome}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {scene.links.map((link, index) => (
                      <Button
                        key={`${link.href}-${index}`}
                        size="sm"
                        variant={index === 0 ? "ai" : "outline"}
                        onClick={() => go(link.href, link.role)}
                        data-demo-id={`demo-scene-${scene.id}-${index}`}
                        className={cn(index === 0 && "shadow-sm")}
                      >
                        {index === 0 ? <Sparkles className="h-3.5 w-3.5" /> : null}
                        {link.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
