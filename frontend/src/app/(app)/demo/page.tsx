"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  GitBranch,
  GraduationCap,
  MessagesSquare,
  MousePointerClick,
  Network,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { cn } from "@/lib/utils";

import { useDemo } from "@/providers/demo-provider";

interface Act {
  id: number;
  title: string;
  message: string;
  outcome: string;
  links: { label: string; href: string; role: "mentor" | "newcomer" }[];
  icon: React.ComponentType<{ className?: string }>;
}

const ACTS: Act[] = [
  {
    id: 1,
    title: "Act 1 — Setup",
    message:
      "Oleg opens the mentor cockpit, grounds it in the company knowledge base, and generates Marina's 30/60/90 plan with the AI Plan Generator. Period by period, sources selected, mentor approves.",
    outcome: "The operating center and the journey are in place.",
    links: [
      { label: "Mentor cockpit", href: "/mentor", role: "mentor" },
      { label: "Knowledge base", href: "/mentor/knowledge", role: "mentor" },
      { label: "AI Plan Generator", href: "/mentor/plan-generator", role: "mentor" },
    ],
    icon: Activity,
  },
  {
    id: 2,
    title: "Act 2 — Marina's daily life",
    message:
      "Switch into Marina. She opens her plan, picks a task, chats with task-context AI, then reads a grounded HR document — with mind map and source-cited answers. The experience feels focused, not overwhelming.",
    outcome: "Newcomer sees only what matters today, with grounded answers.",
    links: [
      { label: "Newcomer home", href: "/newcomer", role: "newcomer" },
      { label: "My plan", href: "/newcomer/plan", role: "newcomer" },
      { label: "Ask AI", href: "/newcomer/ask", role: "newcomer" },
    ],
    icon: MessagesSquare,
  },
  {
    id: 3,
    title: "Act 3 — Signals & adjustments",
    message:
      "Back to mentor. AI flags that Tanya needs attention with evidence — repeated questions, blocked tasks, review patterns. Oleg opens a signal, regenerates a targeted plan change, edits a precise task, and applies the adjustment.",
    outcome: "AI proposes, the mentor decides. Friction caught early.",
    links: [
      { label: "Signals center", href: "/mentor/signals", role: "mentor" },
    ],
    icon: Network,
  },
  {
    id: 4,
    title: "Act 4 — Author courses & onboard a new hire",
    message:
      "Mentor drafts a short HR/process course from selected sources, reviews it, and approves it. Then adds a brand-new hire (Noa Benali), generates a 2-question skill check, and Noa takes the test — triggering plan generation in the background.",
    outcome: "The system scales: courses and new newcomers in minutes, not days.",
    links: [
      { label: "Courses", href: "/mentor/courses", role: "mentor" },
      { label: "Add newcomer", href: "/mentor/newcomers/new", role: "mentor" },
    ],
    icon: GraduationCap,
  },
  {
    id: 5,
    title: "Act 5 — Daily rhythm & closing the loop",
    message:
      "Switch back to Marina. Notifications keep her in sync, the Progress page shows momentum, the Calendar lets her schedule a weekly sync (the dialog is bright, not in shadow), her Kanban submits a task for review. Then back to mentor — same task in his review queue, one click to approve. Loop closed.",
    outcome: "Both sides share the same surface, AI does the lifting, humans decide.",
    links: [
      { label: "Progress", href: "/newcomer/progress", role: "newcomer" },
      { label: "Calendar", href: "/newcomer/calendar", role: "newcomer" },
      { label: "Newcomer Kanban", href: "/newcomer/kanban", role: "newcomer" },
      { label: "Mentor Kanban", href: "/mentor/kanban", role: "mentor" },
    ],
    icon: GitBranch,
  },
];

const SHOWCASE = [
  "Source-grounded answers",
  "AI plan & adjustments",
  "Course authoring",
  "Signals with evidence",
  "Submit & approve loop",
  "Shared calendar & progress",
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
              Demo mode points, fills, and waits for your click.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              Use it during a pitch when you want the app to guide the room: spotlight overlays dim the rest of the UI, arrows pulse on the next control, and form fields fill with demo data. Every navigation and action still waits for a user click, with a Do it helper when you want the tour to perform the highlighted action.
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
                  The tour is deliberate: it never clicks by itself. You can click the target, or use the Do it helper in the tour panel to perform the highlighted action.
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
        {ACTS.map((act) => {
          const Icon = act.icon;
          return (
            <li key={act.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ai-gradient text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand" size="sm">
                          Act {act.id}
                        </Badge>
                        <CardTitle className="text-base">{act.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-1">{act.message}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/45 px-3 py-2 text-xs text-[color:var(--color-fg-muted)]">
                    <span className="font-medium text-[color:var(--color-fg)]">Show: </span>
                    {act.outcome}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {act.links.map((link, index) => (
                      <Button
                        key={`${link.href}-${index}`}
                        size="sm"
                        variant={index === 0 ? "ai" : "outline"}
                        onClick={() => go(link.href, link.role)}
                        data-demo-id={`demo-act-${act.id}-${index}`}
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
