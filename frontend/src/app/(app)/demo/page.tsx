"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Users,
  BookOpen,
  Wand2,
  MessagesSquare,
  AlertTriangle,
  GitBranch,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

import { useDemo } from "@/providers/demo-provider";

interface Scene {
  id: number;
  title: string;
  message: string;
  links: { label: string; href: string; role: "mentor" | "newcomer" }[];
  icon: React.ComponentType<{ className?: string }>;
}

const SCENES: Scene[] = [
  {
    id: 1,
    title: "Mentor creates the plan",
    message:
      "Marko adds Tanya, picks the relevant company docs, and AI drafts a 30/60/90 plan in seconds. Marko reviews, edits, approves.",
    links: [
      { label: "Add newcomer", href: "/mentor/newcomers/new", role: "mentor" },
      { label: "Knowledge base", href: "/mentor/knowledge", role: "mentor" },
      { label: "AI Plan Generator", href: "/mentor/plan-generator", role: "mentor" },
    ],
    icon: Wand2,
  },
  {
    id: 2,
    title: "Newcomer starts onboarding",
    message:
      "Tanya opens her workspace. No information dump — just today's focus, her plan, and people she should know.",
    links: [
      { label: "Newcomer Home", href: "/newcomer", role: "newcomer" },
      { label: "My Plan", href: "/newcomer/plan", role: "newcomer" },
    ],
    icon: Users,
  },
  {
    id: 3,
    title: "Newcomer asks AI",
    message:
      "Tanya asks about deployment. AI answers using her company's docs — with sources and people to ask.",
    links: [{ label: "Ask AI", href: "/newcomer/ask?q=Where%20is%20the%20deployment%20guide%3F", role: "newcomer" }],
    icon: MessagesSquare,
  },
  {
    id: 4,
    title: "AI detects friction",
    message:
      "Tanya doesn't ask for help, but reopens the deployment doc 4×. AI surfaces this signal to Marko with evidence and a suggested 15-min walkthrough.",
    links: [
      { label: "AI Signals Center", href: "/mentor/signals", role: "mentor" },
      { label: "Tanya's profile", href: "/mentor/newcomers", role: "mentor" },
    ],
    icon: AlertTriangle,
  },
  {
    id: 5,
    title: "AI adapts the plan",
    message:
      "Based on Tanya's strengths and gaps, AI proposes adding a deployment pairing session and pushing the production deploy by 3 days. Marko approves.",
    links: [{ label: "Adaptive plan", href: "/mentor/newcomers", role: "mentor" }],
    icon: GitBranch,
  },
];

export default function DemoPage() {
  const router = useRouter();
  const { setRole, newcomerId } = useDemo();

  const go = (href: string, role: "mentor" | "newcomer") => {
    setRole(role);
    // If we have a newcomer ID and the href ends with /newcomers, append it
    let target = href;
    if (href === "/mentor/newcomers" && newcomerId) {
      target = `/mentor/newcomers/${newcomerId}`;
    }
    router.push(target);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Demo scenario"
        title={
          <>
            How a real <span className="ai-gradient-text">onboarding</span> plays out
          </>
        }
        description="5 scenes following Tanya, a backend developer joining the Payments team. Click into any scene — the role switches automatically."
        actions={
          <Button asChild variant="outline">
            <Link href="/mentor">Back to dashboard</Link>
          </Button>
        }
      />

      <AIInsightCard
        title="The point of this product"
        description="AI is not a chatbot bolted on. It generates plans, watches for friction, suggests adaptations, and routes evidence to the mentor — so onboarding actually shortens."
        tone="soft"
      />

      <ol className="space-y-4">
        {SCENES.map((scene) => {
          const Icon = scene.icon;
          return (
            <li key={scene.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ai-gradient text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge tone="brand" size="sm">
                          Scene {scene.id}
                        </Badge>
                        <CardTitle>{scene.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-1">{scene.message}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {scene.links.map((l) => (
                      <Button
                        key={l.href}
                        size="sm"
                        variant={l === scene.links[0] ? "ai" : "outline"}
                        onClick={() => go(l.href, l.role)}
                      >
                        {l === scene.links[0] ? <Sparkles className="h-3.5 w-3.5" /> : null}
                        {l.label}
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

      <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white p-5">
        <div className="text-sm font-medium">
          <Sparkles className="inline h-4 w-4 -mt-0.5 mr-1 text-[color:var(--color-primary)]" />
          Why this beats a chatbot
        </div>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 text-sm text-[color:var(--color-fg-muted)]">
          <li>· AI plans the work, not just answers questions.</li>
          <li>· Friction is detected from behavior — not just self-reported.</li>
          <li>· The mentor sees evidence and decides — AI proposes, humans approve.</li>
          <li>· Newcomer sees only what matters today, plus a knowledge workspace.</li>
        </ul>
      </div>
    </div>
  );
}
