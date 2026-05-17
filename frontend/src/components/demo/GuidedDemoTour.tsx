"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ChevronRight,
  MousePointerClick,
  Pause,
  Play,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDemo } from "@/providers/demo-provider";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/constants";

interface FillAction {
  target: string;
  value: string;
}

interface DemoTourStep {
  id: string;
  route: string;
  role: Role;
  target: string;
  title: string;
  body: string;
  fill?: FillAction[];
  autoAfter?: number;
  autoAdvanceAfter?: number;
  clickTarget?: string;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

const TOUR_STEPS: DemoTourStep[] = [
  {
    id: "start",
    route: "/demo",
    role: "mentor",
    target: "demo-tour-start",
    title: "Guided demo mode",
    body: "The tour will switch roles, point at the next action, and auto-click safe UI steps so the story keeps moving.",
    autoAdvanceAfter: 2400,
  },
  {
    id: "mentor-pulse",
    route: "/mentor",
    role: "mentor",
    target: "mentor-ai-pulse",
    title: "AI cockpit",
    body: "Start with the mentor view: active onboardings, live signals, draft plans, and time saved are visible at a glance.",
    autoAdvanceAfter: 2800,
  },
  {
    id: "newcomer-entry",
    route: "/mentor",
    role: "mentor",
    target: "mentor-hero-add-newcomer",
    title: "Add a newcomer",
    body: "The demo clicks into onboarding setup, where profile context becomes the seed for plans, checks, and recommendations.",
    clickTarget: "mentor-hero-add-newcomer",
    autoAfter: 2100,
  },
  {
    id: "profile-fill",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "add-newcomer-profile",
    title: "Profile auto-fill",
    body: "Fields are filled with realistic demo data before the tour moves to role context.",
    fill: [
      { target: "add-newcomer-full-name", value: "Daria Melnyk" },
      { target: "add-newcomer-email", value: "daria@orynt.demo" },
    ],
    clickTarget: "add-newcomer-next",
    autoAfter: 3200,
  },
  {
    id: "role-fill",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "add-newcomer-role-context",
    title: "Role context",
    body: "The role, team, start date, and first-month goal are captured so AI can avoid a generic plan.",
    fill: [
      { target: "add-newcomer-job-title", value: "Backend Developer" },
      { target: "add-newcomer-team", value: "Payments" },
      { target: "add-newcomer-start-date", value: "2026-05-18" },
      { target: "add-newcomer-main-goal", value: "Ship a safe payment webhook change in the first month" },
    ],
    clickTarget: "add-newcomer-next",
    autoAfter: 3200,
  },
  {
    id: "skills-fill",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "add-newcomer-skills",
    title: "Skills, gaps, and skill check",
    body: "The mentor can add known strengths, suspected gaps, and generate a calibration assessment before the newcomer starts.",
    fill: [
      { target: "add-newcomer-known-skills", value: "Python, PostgreSQL, REST APIs, code reviews" },
      { target: "add-newcomer-known-gaps", value: "Kubernetes deployments, internal payment flows, rollback playbooks" },
    ],
    clickTarget: "add-newcomer-next",
    autoAfter: 3400,
  },
  {
    id: "review",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "add-newcomer-review",
    title: "Human review stays in charge",
    body: "The tour stops before creating a real newcomer. In the live app, this step publishes the profile and optional assessment.",
    autoAdvanceAfter: 3200,
  },
  {
    id: "plan-generator",
    route: "/mentor/plan-generator",
    role: "mentor",
    target: "plan-generator-journey",
    title: "Plan generator",
    body: "Plans now work as a journey: periods can be generated, reviewed, adjusted, and versioned over time.",
    autoAdvanceAfter: 2600,
  },
  {
    id: "new-period",
    route: "/mentor/plan-generator",
    role: "mentor",
    target: "plan-generator-new-period",
    title: "Generate a new period",
    body: "The demo opens the period flow to show how a mentor can brief the AI without leaving the journey view.",
    clickTarget: "plan-generator-new-period",
    autoAfter: 2200,
  },
  {
    id: "period-brief",
    route: "/mentor/plan-generator",
    role: "mentor",
    target: "period-flow-period",
    title: "Brief the AI",
    body: "Dates, goals, mentor notes, and source selection are visible before generation starts.",
    fill: [
      { target: "period-flow-goal", value: "Own a small backend change end-to-end with a reviewed rollback plan." },
      { target: "period-flow-notes", value: "Strong API fundamentals. Needs more confidence around staging deployment and incident handoff." },
    ],
    clickTarget: "period-flow-next",
    autoAfter: 3600,
  },
  {
    id: "period-mode",
    route: "/mentor/plan-generator",
    role: "mentor",
    target: "period-flow-live-mode",
    title: "Choose live collaboration",
    body: "Live mode lets the audience see the AI reason, ask questions, and react to mentor comments.",
    clickTarget: "period-flow-live-mode",
    autoAfter: 2200,
  },
  {
    id: "period-review",
    route: "/mentor/plan-generator",
    role: "mentor",
    target: "period-flow-next",
    title: "Review before launch",
    body: "The tour moves to review, then avoids launching generation so the demo stays safe and repeatable.",
    clickTarget: "period-flow-next",
    autoAfter: 1800,
  },
  {
    id: "period-ready",
    route: "/mentor/plan-generator",
    role: "mentor",
    target: "period-flow-review",
    title: "Ready to generate",
    body: "This is the handoff point: AI is ready, but the mentor still decides when to generate the draft.",
    autoAdvanceAfter: 3200,
  },
  {
    id: "courses",
    route: "/mentor/courses",
    role: "mentor",
    target: "mentor-courses-new",
    title: "Courses from knowledge",
    body: "The demo now includes AI-generated course outlines, lessons, review states, and newcomer consumption.",
    autoAdvanceAfter: 3000,
  },
  {
    id: "signals",
    route: "/mentor/signals",
    role: "mentor",
    target: "signals-run-detection",
    title: "Signals center",
    body: "Behavioral signals, evidence, suggested meetings, plan adjustments, and course creation all meet here.",
    autoAdvanceAfter: 3200,
  },
  {
    id: "newcomer-home",
    route: "/newcomer",
    role: "newcomer",
    target: "newcomer-ask-ai",
    title: "Switch to newcomer",
    body: "The role switches automatically so the audience sees the daily focus, docs, people, assessment, and Ask AI.",
    clickTarget: "newcomer-ask-ai",
    autoAfter: 2600,
  },
  {
    id: "ask-ai",
    route: "/newcomer/ask",
    role: "newcomer",
    target: "ask-ai-composer",
    title: "Ask AI with grounded sources",
    body: "The question box is filled and sent. The answer returns with clickable source citations and people to ask.",
    fill: [{ target: "ask-ai-input", value: "Where is the deployment guide and who can help me?" }],
    clickTarget: "ask-ai-submit",
    autoAfter: 3200,
  },
  {
    id: "finish",
    route: "/newcomer",
    role: "newcomer",
    target: "newcomer-today-list",
    title: "End-to-end onboarding loop",
    body: "You have shown the loop: mentor setup, AI plan generation, courses, signals, and the newcomer workspace.",
    autoAdvanceAfter: 5200,
  },
];

export function GuidedDemoTour() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();
  const {
    guidedDemoActive,
    guidedDemoStep,
    setGuidedDemoStep,
    stopGuidedDemo,
    setRole,
  } = useDemo();
  const [targetRect, setTargetRect] = React.useState<TargetRect | null>(null);
  const [targetReady, setTargetReady] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const scrolledStepRef = React.useRef<string | null>(null);

  const step = TOUR_STEPS[guidedDemoStep] ?? null;
  const targetPath = step ? pathOnly(step.route) : "/";
  const onTargetRoute = pathname === targetPath;

  React.useEffect(() => {
    if (!guidedDemoActive) return;
    if (!step) {
      stopGuidedDemo();
      return;
    }
    setRole(step.role);
    if (!onTargetRoute) {
      router.push(step.route);
    }
  }, [guidedDemoActive, onTargetRoute, router, setRole, step, stopGuidedDemo]);

  React.useEffect(() => {
    if (!guidedDemoActive || !step || !onTargetRoute) {
      queueMicrotask(() => {
        setTargetRect(null);
        setTargetReady(false);
      });
      return;
    }

    let active = true;
    let raf = 0;
    scrolledStepRef.current = null;

    const update = () => {
      const element = findDemoElement(step.target);
      if (!active) return;
      if (!element) {
        setTargetRect(null);
        setTargetReady(false);
        return;
      }
      if (scrolledStepRef.current !== step.id) {
        scrolledStepRef.current = step.id;
        element.scrollIntoView({ block: "center", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
      }
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      });
      setTargetReady(true);
    };

    const schedule = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    const interval = window.setInterval(update, 250);
    const delayed = window.setTimeout(update, 120);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    update();

    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearTimeout(delayed);
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [guidedDemoActive, onTargetRoute, reduceMotion, step]);

  React.useEffect(() => {
    if (!guidedDemoActive || !step || !onTargetRoute || paused) return;
    if (step.target && !targetReady) return;

    const timers: number[] = [];
    const fillDelay = window.setTimeout(() => {
      step.fill?.forEach(({ target, value }) => fillDemoValue(target, value));
    }, 650);
    timers.push(fillDelay);

    const clickTarget = step.clickTarget;
    if (clickTarget) {
      const clickDelay = window.setTimeout(() => {
        const element = findDemoElement(clickTarget);
        element?.classList.add("demo-auto-click");
        element?.click();
        timers.push(
          window.setTimeout(() => {
            element?.classList.remove("demo-auto-click");
            setGuidedDemoStep(guidedDemoStep + 1);
          }, 520),
        );
      }, step.autoAfter ?? 2600);
      timers.push(clickDelay);
    } else if (step.autoAdvanceAfter) {
      const advanceDelay = window.setTimeout(() => {
        setGuidedDemoStep(guidedDemoStep + 1);
      }, step.autoAdvanceAfter);
      timers.push(advanceDelay);
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [
    guidedDemoActive,
    guidedDemoStep,
    onTargetRoute,
    paused,
    setGuidedDemoStep,
    step,
    targetReady,
  ]);

  if (!guidedDemoActive || !step) return null;

  const panel = getPanelPosition(targetRect);
  const arrow = getArrowPosition(targetRect);
  const current = guidedDemoStep + 1;
  const total = TOUR_STEPS.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] pointer-events-none">
        {targetRect ? (
          <>
            <motion.div
              key={`${step.id}-spotlight`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed rounded-[18px] border-2 border-[color:var(--color-primary)] bg-transparent shadow-[0_0_0_9999px_rgba(12,10,9,0.56),0_0_0_8px_rgba(249,115,22,0.18),0_16px_44px_-18px_rgba(249,115,22,0.65)]"
              style={{
                top: Math.max(8, targetRect.top - 8),
                left: Math.max(8, targetRect.left - 8),
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            />
            <motion.div
              key={`${step.id}-pulse`}
              aria-hidden
              className="fixed rounded-[20px] border border-white/80"
              style={{
                top: Math.max(6, targetRect.top - 12),
                left: Math.max(6, targetRect.left - 12),
                width: targetRect.width + 24,
                height: targetRect.height + 24,
              }}
              animate={reduceMotion ? undefined : { opacity: [0.25, 0.85, 0.25], scale: [1, 1.025, 1] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            />
            <motion.div
              key={`${step.id}-arrow`}
              className="fixed z-[82] grid h-10 w-10 place-items-center rounded-full ai-gradient text-white shadow-[var(--shadow-ai)]"
              style={{ left: arrow.left, top: arrow.top }}
              initial={reduceMotion ? false : { opacity: 0, y: arrow.pointsDown ? -8 : 8 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: arrow.pointsDown ? [0, 8, 0] : [0, -8, 0] }}
              transition={{ repeat: reduceMotion ? 0 : Infinity, duration: 1.05, ease: "easeInOut" }}
            >
              <ArrowDown className={cn("h-5 w-5", !arrow.pointsDown && "rotate-180")} />
            </motion.div>
          </>
        ) : (
          <div className="fixed inset-0 bg-stone-950/45" />
        )}

        <motion.div
          key={step.id}
          initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="pointer-events-auto fixed z-[83] w-[min(360px,calc(100vw-32px))] rounded-2xl border border-white/50 bg-white p-4 shadow-[0_20px_70px_-28px_rgba(12,10,9,0.55)]"
          style={{ left: panel.left, top: panel.top }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
                <Sparkles className="h-3 w-3" />
                Demo mode {current}/{total}
              </div>
              <h2 className="mt-1 text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
                {step.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={stopGuidedDemo}
              className="rounded-md p-1.5 text-[color:var(--color-fg-muted)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]"
              aria-label="Stop demo mode"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
            {step.body}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
            <motion.div
              className="h-full rounded-full ai-gradient"
              initial={false}
              animate={{ width: `${(current / total) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setPaused((value) => !value)}>
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? "Resume" : "Pause"}
            </Button>
            <div className="flex items-center gap-2">
              {step.clickTarget ? (
                <span className="hidden items-center gap-1 text-[11px] font-medium text-[color:var(--color-primary-active)] sm:inline-flex">
                  <MousePointerClick className="h-3.5 w-3.5" /> auto-click
                </span>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ai"
                onClick={() => {
                  if (guidedDemoStep >= TOUR_STEPS.length - 1) stopGuidedDemo();
                  else setGuidedDemoStep(guidedDemoStep + 1);
                }}
              >
                {guidedDemoStep >= TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function pathOnly(route: string): string {
  return route.split("?")[0] || "/";
}

function findDemoElement(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-demo-id="${id}"]`);
}

function fillDemoValue(target: string, value: string) {
  const element = findDemoElement(target);
  if (!element) return;
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return;
  setNativeValue(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
  const prototypeSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (prototypeSetter && valueSetter !== prototypeSetter) {
    prototypeSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

function getPanelPosition(rect: TargetRect | null) {
  const width = 360;
  const height = 220;
  const margin = 16;
  if (typeof window === "undefined" || !rect) {
    return { left: margin, top: margin };
  }
  const left = clamp(rect.left, margin, window.innerWidth - width - margin);
  const belowTop = rect.bottom + margin;
  const aboveTop = rect.top - height - margin;
  const top = belowTop + height < window.innerHeight ? belowTop : Math.max(margin, aboveTop);
  return { left, top };
}

function getArrowPosition(rect: TargetRect | null) {
  const margin = 12;
  if (typeof window === "undefined" || !rect) {
    return { left: margin, top: margin, pointsDown: true };
  }
  const pointsDown = rect.top > 74;
  const left = clamp(rect.left + rect.width / 2 - 20, margin, window.innerWidth - 52);
  const top = pointsDown ? Math.max(margin, rect.top - 58) : Math.min(window.innerHeight - 52, rect.bottom + 18);
  return { left, top, pointsDown };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
