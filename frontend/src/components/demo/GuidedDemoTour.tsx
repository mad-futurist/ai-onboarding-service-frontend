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
  routeMatch?: "exact" | "prefix";
  role: Role;
  target: string;
  title: string;
  body: string;
  fill?: FillAction[];
  waitForClickTarget?: string;
  advanceDelayAfterClick?: number;
  autoNavigate?: boolean;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export interface DemoTourStepSummary {
  index: number;
  id: string;
  title: string;
  route: string;
  role: Role;
}

const TOUR_STEPS: DemoTourStep[] = [
  {
    id: "welcome",
    route: "/demo",
    role: "mentor",
    target: "demo-tour-start",
    title: "Welcome to the ReadySet.AI walkthrough",
    body: "In about 5 minutes we'll cover the full loop: mentor cockpit, knowledge-grounded plan, Marina's daily work, AI signals & plan adjustments, course authoring, onboarding a new hire, then the daily rhythm — notifications, progress, calendar, submit & approve. Click Next to start by regenerating fresh demo data.",
    autoNavigate: false,
  },
  {
    id: "nav-settings-regenerate",
    route: "/demo",
    role: "mentor",
    target: "nav-mentor-settings",
    title: "Open Settings",
    body: "We'll start by resetting the demo database so the walkthrough runs from a clean, predictable state. The reset button lives at the bottom of Settings — open it from the sidebar.",
    waitForClickTarget: "nav-mentor-settings",
  },
  {
    id: "regenerate-database",
    route: "/mentor/settings",
    role: "mentor",
    target: "settings-regenerate",
    title: "Regenerate the demo database",
    body: "Click Regenerate database. Confirm in the browser prompt — this wipes the workspace and recreates Oleg, Marina, Tanya, their plans, documents, courses and signals. Takes a few seconds.",
    waitForClickTarget: "settings-regenerate",
    advanceDelayAfterClick: 5500,
  },
  {
    id: "mentor-dashboard",
    route: "/mentor",
    role: "mentor",
    target: "mentor-dashboard-newcomers",
    title: "Mentor cockpit first",
    body: "Start in Oleg's cockpit. The seeded demo shows two active newcomers — Marina (Sales) and Tanya (Backend/Payments) — with live progress, attention signals, today's focus, and saved time, all in one place.",
  },
  {
    id: "open-marina-switcher",
    route: "/mentor",
    role: "mentor",
    target: "role-switcher-trigger",
    title: "Viewing as Marina",
    body: "Open the persona switcher. The tour will wait for your click before it moves.",
    waitForClickTarget: "role-switcher-trigger",
  },
  {
    id: "choose-marina",
    route: "/mentor",
    role: "mentor",
    target: "role-persona-marina-kovalenko",
    title: "Choose Marina",
    body: "Select Marina Kovalenko so the room sees the newcomer workspace from her point of view.",
    waitForClickTarget: "role-persona-marina-kovalenko",
  },
  {
    id: "nav-marina-plan",
    route: "/newcomer",
    role: "newcomer",
    target: "nav-newcomer-plan",
    title: "Open Marina's plan",
    body: "Use the sidebar navigation to open My plan. Navigation clicks are manual too.",
    waitForClickTarget: "nav-newcomer-plan",
  },
  {
    id: "marina-plan",
    route: "/newcomer/plan",
    role: "newcomer",
    target: "newcomer-plan-journey",
    title: "Marina's onboarding journey",
    body: "Her plan reads like a journey, not a wall of tickets — progress per week, day-level tasks, AI-recommended sources and people for each beat. Focused, not overwhelming.",
  },
  {
    id: "open-marina-task",
    route: "/newcomer/plan",
    role: "newcomer",
    target: "newcomer-plan-first-task",
    title: "Open a task",
    body: "Click the highlighted task to drill into task context, acceptance criteria, sources, and help channels.",
    waitForClickTarget: "newcomer-plan-first-task",
  },
  {
    id: "marina-task-detail",
    route: "/newcomer/tasks/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "newcomer-task-detail",
    title: "Task detail",
    body: "The task page keeps the work concrete: description, checklist, related sources, and people who can help.",
  },
  {
    id: "open-task-chat",
    route: "/newcomer/tasks/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "newcomer-task-chat",
    title: "Discuss the task",
    body: "Open the task chat. The AI carries task context into the conversation.",
    waitForClickTarget: "newcomer-task-chat",
  },
  {
    id: "ask-task-question",
    route: "/newcomer/tasks/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "task-ask-submit",
    title: "Task chat with a prepared prompt",
    body: "The prompt is filled in. Click Send when you want the AI response.",
    fill: [
      {
        target: "task-ask-input",
        value: "Help me understand the expected output and the first step for this task.",
      },
    ],
    waitForClickTarget: "task-ask-submit",
  },
  {
    id: "task-chat-response",
    route: "/newcomer/tasks/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "task-ask-latest-answer",
    title: "Read the task chat answer",
    body: "Wait for the AI answer to appear. The tour keeps the response highlighted; click Next only after the answer is visible.",
  },
  {
    id: "back-to-task",
    route: "/newcomer/tasks/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "task-ask-back-to-task",
    title: "Back to the task",
    body: "Return to the task detail so you can open the source document attached to the work.",
    waitForClickTarget: "task-ask-back-to-task",
  },
  {
    id: "open-task-document",
    route: "/newcomer/tasks/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "newcomer-task-first-source",
    title: "Open the document",
    body: "Open the first related source to show how tasks stay grounded in company knowledge.",
    waitForClickTarget: "newcomer-task-first-source",
  },
  {
    id: "document-preview",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "document-preview",
    title: "Document preview",
    body: "The document is readable before any AI layer appears. The next steps show mind map and chat.",
  },
  {
    id: "open-mindmap-tab",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "document-tab-mindmap",
    title: "Mind map tab",
    body: "Open Mind map manually. The tour will not switch tabs for you.",
    waitForClickTarget: "document-tab-mindmap",
  },
  {
    id: "generate-mindmap",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "document-mindmap-generate",
    title: "Generate the mind map",
    body: "Click Generate mind map to turn the document into a visual structure.",
    waitForClickTarget: "document-mindmap-generate",
  },
  {
    id: "mindmap-result",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "document-mindmap-result",
    title: "Mind map generated",
    body: "The map turns a 20-page document into a navigable structure — central topic, branches, leaf ideas. Marina can scan the shape of the doc in 30 seconds before reading.",
  },
  {
    id: "open-document-chat",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "document-tab-ask",
    title: "Ask about the document",
    body: "Open the Ask tab so Marina can discuss a real HR process question.",
    waitForClickTarget: "document-tab-ask",
  },
  {
    id: "ask-hr-process",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "document-chat-submit",
    title: "Chat about the HR process",
    body: "The question is prefilled. Click Ask to keep the answer grounded in available sources.",
    fill: [
      {
        target: "document-chat-input",
        value: "Can you explain the HR onboarding process and what I should do first?",
      },
    ],
    waitForClickTarget: "document-chat-submit",
  },
  {
    id: "document-chat-response",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "document-chat-latest-answer",
    title: "Read the HR process answer",
    body: "Wait for the grounded answer to render in the document chat. The highlighted response is the moment to pause before continuing.",
  },
  {
    id: "open-mentor-switcher",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "role-switcher-trigger",
    title: "Back to mentor",
    body: "Open Viewing as again so we can return to Oleg's mentor workspace.",
    waitForClickTarget: "role-switcher-trigger",
  },
  {
    id: "choose-mentor",
    route: "/newcomer/knowledge/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "role-persona-oleg-bondarenko",
    title: "Choose Oleg",
    body: "Select the mentor persona.",
    waitForClickTarget: "role-persona-oleg-bondarenko",
  },
  {
    id: "nav-mentor-courses",
    route: "/mentor",
    role: "mentor",
    target: "nav-mentor-courses",
    title: "Add a course",
    body: "Use the mentor sidebar to open Courses.",
    waitForClickTarget: "nav-mentor-courses",
  },
  {
    id: "open-new-course",
    route: "/mentor/courses",
    role: "mentor",
    target: "mentor-courses-new",
    title: "Create a new course",
    body: "Click New course. We will draft a small HR/process course that Marina can see.",
    waitForClickTarget: "mentor-courses-new",
  },
  {
    id: "generate-course",
    route: "/mentor/courses/new",
    role: "mentor",
    target: "course-generate-ai",
    title: "Course inputs are ready",
    body: "The fields are prefilled for a short process course. Click Generate with AI when ready.",
    fill: [
      { target: "course-title", value: "HR Process Essentials for Newcomers" },
      {
        target: "course-prompt",
        value:
          "Create a concise onboarding course that explains the HR process, first-week admin steps, and where a newcomer asks for help.",
      },
      { target: "course-role-target", value: "all" },
    ],
    waitForClickTarget: "course-generate-ai",
  },
  {
    id: "course-editor",
    route: "/mentor/courses/",
    routeMatch: "prefix",
    role: "mentor",
    target: "course-editor",
    title: "Course draft, ready to refine",
    body: "AI drafts the course from the selected knowledge sources — title, lessons, structure. The mentor stays in control: edit any lesson, then approve before it's visible to newcomers.",
    autoNavigate: false,
  },
  {
    id: "submit-course",
    route: "/mentor/courses/",
    routeMatch: "prefix",
    role: "mentor",
    target: "course-submit-review",
    title: "Submit the course",
    body: "Click Submit for review. This is still a deliberate mentor action.",
    waitForClickTarget: "course-submit-review",
  },
  {
    id: "approve-course",
    route: "/mentor/courses/",
    routeMatch: "prefix",
    role: "mentor",
    target: "course-approve",
    title: "Approve the course",
    body: "Approve the course so it becomes visible to newcomers.",
    waitForClickTarget: "course-approve",
  },
  {
    id: "switch-marina-for-course",
    route: "/mentor/courses/",
    routeMatch: "prefix",
    role: "mentor",
    target: "role-switcher-trigger",
    title: "Return to Marina",
    body: "Open the persona switcher again.",
    waitForClickTarget: "role-switcher-trigger",
  },
  {
    id: "choose-marina-course",
    route: "/mentor/courses/",
    routeMatch: "prefix",
    role: "mentor",
    target: "role-persona-marina-kovalenko",
    title: "View as Marina again",
    body: "Select Marina to verify the course is available from her workspace.",
    waitForClickTarget: "role-persona-marina-kovalenko",
  },
  {
    id: "nav-marina-courses",
    route: "/newcomer",
    role: "newcomer",
    target: "nav-newcomer-courses",
    title: "Open Marina's courses",
    body: "Use the newcomer sidebar to open Courses.",
    waitForClickTarget: "nav-newcomer-courses",
  },
  {
    id: "open-marina-course",
    route: "/newcomer/courses",
    role: "newcomer",
    target: "newcomer-courses-first-course",
    title: "See the course",
    body: "Open the first recommended course to show the newcomer learning view.",
    waitForClickTarget: "newcomer-courses-first-course",
  },
  {
    id: "course-reader",
    route: "/newcomer/courses/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "newcomer-course-reader",
    title: "Course reader",
    body: "Marina can read lessons, track progress, and take notes without leaving her workspace.",
  },
  {
    id: "switch-mentor-for-signals",
    route: "/newcomer/courses/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "role-switcher-trigger",
    title: "Back to mentor signals",
    body: "Open Viewing as so Oleg can inspect Tanya's attention signals.",
    waitForClickTarget: "role-switcher-trigger",
  },
  {
    id: "choose-mentor-signals",
    route: "/newcomer/courses/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "role-persona-oleg-bondarenko",
    title: "Choose Oleg",
    body: "Return to the mentor persona.",
    waitForClickTarget: "role-persona-oleg-bondarenko",
  },
  {
    id: "nav-signals",
    route: "/mentor",
    role: "mentor",
    target: "nav-mentor-signals",
    title: "Open Signals",
    body: "Use the sidebar to open the Signals center.",
    waitForClickTarget: "nav-mentor-signals",
  },
  {
    id: "open-signals-selector",
    route: "/mentor/signals",
    role: "mentor",
    target: "signals-newcomer-select",
    title: "Select Tanya",
    body: "Open the newcomer selector to inspect Tanya's attention state.",
    waitForClickTarget: "signals-newcomer-select",
  },
  {
    id: "choose-tanya-signals",
    route: "/mentor/signals",
    role: "mentor",
    target: "signals-newcomer-tanya-petrova",
    title: "Tanya needs attention",
    body: "Choose Tanya Petrova. Her open signals show where mentor intervention is useful.",
    waitForClickTarget: "signals-newcomer-tanya-petrova",
  },
  {
    id: "open-attention-signal",
    route: "/mentor/signals",
    role: "mentor",
    target: "signals-attention-signal",
    title: "Open an attention signal",
    body: "Click the highlighted signal to see evidence and suggested actions.",
    waitForClickTarget: "signals-attention-signal",
  },
  {
    id: "signal-adjust-plan",
    route: "/mentor/signals",
    role: "mentor",
    target: "signal-drawer-adjust-plan",
    title: "Turn a signal into a plan change",
    body: "From the signal drawer, click Regenerate plan. The AI proposes targeted modifications informed by the signal evidence — the mentor stays in the loop to approve.",
    waitForClickTarget: "signal-drawer-adjust-plan",
  },
  {
    id: "choose-targeted-changes",
    route: "/mentor/signals",
    role: "mentor",
    target: "adjust-entry-granular",
    title: "Targeted changes",
    body: "Choose targeted changes so the draft can modify individual tasks precisely.",
    waitForClickTarget: "adjust-entry-granular",
  },
  {
    id: "confirm-adjust-period",
    route: "/mentor/signals",
    role: "mentor",
    target: "adjust-period-confirm",
    title: "Pick the period",
    body: "Confirm the recommended period for the signal-aware adjustment.",
    waitForClickTarget: "adjust-period-confirm",
  },
  {
    id: "generate-adjustment-draft",
    route: "/mentor/signals",
    role: "mentor",
    target: "period-adjustment-generate",
    title: "Generate the adjustment draft",
    body: "Click Generate from signal. The draft is created only after this deliberate mentor action.",
    waitForClickTarget: "period-adjustment-generate",
  },
  {
    id: "adjustment-draft",
    route: "/mentor/signals",
    role: "mentor",
    target: "period-adjustment-draft",
    title: "Adjustment draft",
    body: "The draft proposes changes to unfinished work. You can accept, skip, defer, or edit each change.",
  },
  {
    id: "edit-change-card",
    route: "/mentor/signals",
    role: "mentor",
    target: "change-card-edit",
    title: "Precise task edits",
    body: "Open the editor on a proposed change to adjust the exact task title, description, week, day, and reason.",
    waitForClickTarget: "change-card-edit",
  },
  {
    id: "save-change-edit",
    route: "/mentor/signals",
    role: "mentor",
    target: "change-editor-save",
    title: "Save the precise edit",
    body: "The edit fields are prefilled with a sharper action. Click Save edits.",
    fill: [
      { target: "change-editor-title", value: "Add a focused staging dry run" },
      {
        target: "change-editor-description",
        value:
          "Schedule a hands-on staging deployment dry run with Victor, then capture rollback checkpoints in the PR notes.",
      },
      { target: "change-editor-reason", value: "Tanya needs practice on deployment confidence before independent release work." },
    ],
    waitForClickTarget: "change-editor-save",
  },
  {
    id: "apply-adjustment",
    route: "/mentor/signals",
    role: "mentor",
    target: "period-adjustment-apply",
    title: "Apply modifications",
    body: "Apply the selected changes to the plan when the mentor is satisfied.",
    waitForClickTarget: "period-adjustment-apply",
  },
  {
    id: "nav-add-newcomer",
    route: "/mentor/signals",
    role: "mentor",
    target: "nav-mentor-newcomers-new",
    title: "Add a new newcomer",
    body: "Now use the sidebar to add a brand-new newcomer.",
    waitForClickTarget: "nav-mentor-newcomers-new",
  },
  {
    id: "newcomer-profile",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "add-newcomer-next",
    title: "Profile is prefilled",
    body: "Review the prepared profile, then click Continue.",
    fill: [
      { target: "add-newcomer-full-name", value: "Noa Benali" },
      { target: "add-newcomer-email", value: "noa.benali@orynt.demo" },
    ],
    waitForClickTarget: "add-newcomer-next",
  },
  {
    id: "newcomer-role",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "add-newcomer-next",
    title: "Role context",
    body: "The Backend/Platform context is ready. Click Continue.",
    fill: [
      { target: "add-newcomer-job-title", value: "Backend Developer" },
      { target: "add-newcomer-team", value: "Platform" },
      { target: "add-newcomer-start-date", value: "2026-05-25" },
      { target: "add-newcomer-main-goal", value: "Ship a small backend improvement with tests in the first month" },
    ],
    waitForClickTarget: "add-newcomer-next",
  },
  {
    id: "generate-two-question-test",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "assessment-generate-fast",
    title: "Generate the skill test",
    body: "The skill gaps and two-question assessment are prepared. Click Generate fast.",
    fill: [
      { target: "add-newcomer-known-skills", value: "Python, SQL, API design" },
      { target: "add-newcomer-known-gaps", value: "Internal release workflow, incident handoff" },
      { target: "assessment-mentor-notes", value: "Keep it short: two practical questions on release workflow and incident handoff." },
    ],
    waitForClickTarget: "assessment-generate-fast",
  },
  {
    id: "two-question-draft",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "assessment-draft-editor",
    title: "Two questions ready",
    body: "The newcomer test is now a short draft with two questions. Review it before finishing setup.",
  },
  {
    id: "review-newcomer",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "add-newcomer-next",
    title: "Review the newcomer",
    body: "Move to the final review step.",
    waitForClickTarget: "add-newcomer-next",
  },
  {
    id: "submit-newcomer",
    route: "/mentor/newcomers/new",
    role: "mentor",
    target: "add-newcomer-submit",
    title: "Create newcomer",
    body: "Click Add newcomer. The assessment will be published to this new workspace.",
    waitForClickTarget: "add-newcomer-submit",
    advanceDelayAfterClick: 1400,
  },
  {
    id: "newcomer-created",
    route: "/mentor/knowledge",
    role: "mentor",
    target: "mentor-knowledge-page",
    title: "Newcomer created",
    body: "The new profile is created. Next, switch into the latest newcomer workspace to take the two-question test.",
    autoNavigate: false,
  },
  {
    id: "open-latest-switcher",
    route: "/mentor/knowledge",
    role: "mentor",
    target: "role-switcher-trigger",
    title: "View as the new newcomer",
    body: "Open the persona switcher.",
    waitForClickTarget: "role-switcher-trigger",
  },
  {
    id: "choose-latest-newcomer",
    route: "/mentor/knowledge",
    role: "mentor",
    target: "role-persona-latest-newcomer",
    title: "Choose the new newcomer",
    body: "Select the latest newcomer persona created in this demo.",
    waitForClickTarget: "role-persona-latest-newcomer",
  },
  {
    id: "start-newcomer-test",
    route: "/newcomer",
    role: "newcomer",
    target: "newcomer-assessment-start",
    title: "Take the two-question test",
    body: "The skill check appears in the newcomer dashboard. Click Start.",
    waitForClickTarget: "newcomer-assessment-start",
  },
  {
    id: "answer-test-one",
    route: "/newcomer/assessment",
    role: "newcomer",
    target: "assessment-runner-next",
    title: "Question 1",
    body: "The first answer is prefilled. Click Next.",
    fill: [
      {
        target: "assessment-answer-input",
        value: "I would read the release checklist, run tests locally, and ask the owner to confirm the rollback path before staging.",
      },
    ],
    waitForClickTarget: "assessment-runner-next",
  },
  {
    id: "answer-test-two",
    route: "/newcomer/assessment",
    role: "newcomer",
    target: "assessment-runner-next",
    title: "Question 2",
    body: "The second answer is prefilled. Click Submit to finish the test and trigger plan generation.",
    fill: [
      {
        target: "assessment-answer-input",
        value: "If I am blocked, I would document the exact error, tag the owner, and propose the smallest next diagnostic step.",
      },
    ],
    waitForClickTarget: "assessment-runner-next",
    advanceDelayAfterClick: 3600,
  },
  {
    id: "switch-mentor-after-test",
    route: "/newcomer",
    routeMatch: "prefix",
    role: "newcomer",
    target: "role-switcher-trigger",
    title: "Back to mentor after submission",
    body: "The submitted test triggers plan generation in the background. Open Viewing as and return to Oleg.",
    autoNavigate: false,
    waitForClickTarget: "role-switcher-trigger",
  },
  {
    id: "choose-mentor-after-test",
    route: "/newcomer",
    routeMatch: "prefix",
    role: "newcomer",
    target: "role-persona-oleg-bondarenko",
    title: "Choose Oleg",
    body: "Return to the mentor dashboard to see the new plan status.",
    waitForClickTarget: "role-persona-oleg-bondarenko",
  },
  {
    id: "mentor-sees-plan",
    route: "/mentor",
    role: "mentor",
    target: "mentor-dashboard-newcomers",
    title: "Plan generated for Noa",
    body: "Back on the dashboard, the new newcomer appears with her freshly generated draft plan. The card is highlighted; the next step opens her workspace.",
  },
  {
    id: "closing-mentor-open-noa-workspace",
    route: "/mentor",
    role: "mentor",
    target: "mentor-newcomer-card-latest",
    title: "Open Noa's workspace",
    body: "Click Noa's card to open her workspace — the mentor's single view of one newcomer: plan, blocked items, signals, skills.",
    waitForClickTarget: "mentor-newcomer-card-latest",
  },
  {
    id: "closing-mentor-noa-plan",
    route: "/mentor/newcomers/",
    routeMatch: "prefix",
    role: "mentor",
    target: "mentor-newcomer-plan-tabs",
    title: "Noa's full plan",
    body: "The AI generated a 30/60/90 plan from her profile, skill gaps, and the company knowledge base. Tabs split it by phase; weeks group the tasks.",
  },
  {
    id: "closing-mentor-noa-first-task",
    route: "/mentor/newcomers/",
    routeMatch: "prefix",
    role: "mentor",
    target: "mentor-newcomer-first-task",
    title: "Every task is editable",
    body: "Click the highlighted task to open the editor — the mentor can adjust title, description, type, priority, week, success and acceptance criteria for any task the AI proposed.",
    waitForClickTarget: "mentor-newcomer-first-task",
  },
  {
    id: "closing-mentor-task-editor",
    route: "/mentor/plan-generator/",
    routeMatch: "prefix",
    role: "mentor",
    target: "mentor-task-editor",
    title: "Task editor",
    body: "Every field is editable. The mentor stays in charge of the content — the AI drafts, the mentor refines. Save changes propagates instantly to the newcomer's plan.",
  },
  {
    id: "closing-open-switcher-to-marina",
    route: "/mentor",
    routeMatch: "prefix",
    role: "mentor",
    target: "role-switcher-trigger",
    title: "Step back into Marina",
    body: "Setup is done. Now switch back to Marina to show her daily operating rhythm: progress, calendar, kanban — the surfaces she lives in.",
    waitForClickTarget: "role-switcher-trigger",
  },
  {
    id: "closing-choose-marina",
    route: "/mentor",
    routeMatch: "prefix",
    role: "mentor",
    target: "role-persona-marina-kovalenko",
    title: "Choose Marina again",
    body: "Re-enter Marina's workspace. The next beats show how a newcomer actually uses the product day after day.",
    waitForClickTarget: "role-persona-marina-kovalenko",
  },
  {
    id: "closing-nav-progress",
    route: "/newcomer",
    role: "newcomer",
    target: "nav-newcomer-progress",
    title: "Open Marina's Progress page",
    body: "Use the sidebar to open Progress. This is Marina's source of truth for where she stands in the journey.",
    waitForClickTarget: "nav-newcomer-progress",
  },
  {
    id: "closing-progress-hero",
    route: "/newcomer/progress",
    role: "newcomer",
    target: "newcomer-progress-hero",
    title: "Progress at a glance",
    body: "Completed, in progress, blocked, and a weekly hint. Marina sees momentum without asking; the mentor sees the same numbers on the dashboard. One shared truth.",
  },
  {
    id: "closing-progress-velocity",
    route: "/newcomer/progress",
    role: "newcomer",
    target: "newcomer-progress-velocity",
    title: "Weekly velocity & milestones",
    body: "Velocity per week and milestone tracking turn onboarding from vibes into evidence — useful both for Marina and for her mentor's quarterly review.",
  },
  {
    id: "closing-nav-calendar",
    route: "/newcomer/progress",
    role: "newcomer",
    target: "nav-newcomer-calendar",
    title: "Open the Calendar",
    body: "Move to Marina's calendar. Mentor syncs, demo sessions, and ad-hoc help meetings all live here.",
    waitForClickTarget: "nav-newcomer-calendar",
  },
  {
    id: "closing-calendar-grid",
    route: "/newcomer/calendar",
    role: "newcomer",
    target: "newcomer-calendar-grid",
    title: "A month at a glance",
    body: "The calendar shows the full month. Every scheduled session, with its time and Teams link, is here. Marina (or the mentor) can add a meeting on any day.",
  },
  {
    id: "closing-calendar-add",
    route: "/newcomer/calendar",
    role: "newcomer",
    target: "newcomer-calendar-add",
    title: "Schedule a meeting",
    body: "Click Add meeting to open the scheduling dialog. Watch how it appears: bright and on top of the page — the spotlight no longer dims it.",
    waitForClickTarget: "newcomer-calendar-add",
  },
  {
    id: "closing-meeting-dialog-fill",
    route: "/newcomer/calendar",
    role: "newcomer",
    target: "schedule-meeting-submit",
    title: "30-minute weekly sync",
    body: "Title and agenda are pre-filled. The mentor is the default attendee. Click Schedule — the meeting is created, an invite goes out, and a notification fires for the mentor.",
    fill: [
      { target: "schedule-meeting-title", value: "Weekly sync with Marina" },
      {
        target: "schedule-meeting-agenda",
        value: "1) Wins from the week\n2) Blockers and questions\n3) Plan for next week\n4) Anything I can support faster?",
      },
    ],
    waitForClickTarget: "schedule-meeting-submit",
    advanceDelayAfterClick: 1400,
  },
  {
    id: "closing-meeting-saved",
    route: "/newcomer/calendar",
    role: "newcomer",
    target: "newcomer-calendar-grid",
    title: "Meeting saved",
    body: "The new meeting is now on Marina's calendar and on the mentor's. Both sides see the same source of truth — no email chains, no rescheduling drift.",
  },
  {
    id: "closing-nav-kanban",
    route: "/newcomer/calendar",
    role: "newcomer",
    target: "nav-newcomer-kanban",
    title: "Open Marina's task board",
    body: "Use the sidebar to open her Kanban. This is where Marina actually moves work forward day to day.",
    waitForClickTarget: "nav-newcomer-kanban",
  },
  {
    id: "closing-kanban-overview",
    route: "/newcomer/kanban",
    role: "newcomer",
    target: "newcomer-kanban-board",
    title: "Five lanes, one flow",
    body: "To do, In progress, In review, Blocked, Done. Marina drags her own work forward; In review hands off to the mentor for validation; only the mentor moves a task to Done.",
  },
  {
    id: "closing-kanban-in-progress-task",
    route: "/newcomer/kanban",
    role: "newcomer",
    target: "newcomer-kanban-first-active-task",
    title: "Pick a task in progress",
    body: "Click an in-progress task to open it. Marina is going to submit her work for mentor review in one click.",
    waitForClickTarget: "newcomer-kanban-first-active-task",
  },
  {
    id: "closing-task-submit-review",
    route: "/newcomer/tasks/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "newcomer-task-submit-review",
    title: "Submit for review",
    body: "One click. The task moves to In review on Marina's board, lands on the mentor's review queue, and fires a notification. Click Submit for review.",
    waitForClickTarget: "newcomer-task-submit-review",
    advanceDelayAfterClick: 1200,
  },
  {
    id: "closing-back-to-kanban",
    route: "/newcomer/tasks/",
    routeMatch: "prefix",
    role: "newcomer",
    target: "nav-newcomer-kanban",
    title: "Back to the board",
    body: "Open Marina's Kanban again to see where the task landed.",
    waitForClickTarget: "nav-newcomer-kanban",
  },
  {
    id: "closing-kanban-in-review-column",
    route: "/newcomer/kanban",
    role: "newcomer",
    target: "newcomer-kanban-column-in_review",
    title: "Now in the mentor's hands",
    body: "The task has moved to In review. Marina cannot drag it from here — only the mentor can approve. The handoff is explicit, not implicit.",
  },
  {
    id: "closing-open-switcher-to-mentor",
    route: "/newcomer/kanban",
    role: "newcomer",
    target: "role-switcher-trigger",
    title: "Switch to the mentor",
    body: "Open the persona switcher to step back into Oleg and close the loop on the review side.",
    waitForClickTarget: "role-switcher-trigger",
  },
  {
    id: "closing-choose-mentor",
    route: "/newcomer/kanban",
    role: "newcomer",
    target: "role-persona-oleg-bondarenko",
    title: "Choose Oleg",
    body: "Re-enter the mentor workspace. The mentor will now see real notifications from Marina's actions.",
    waitForClickTarget: "role-persona-oleg-bondarenko",
  },
  {
    id: "closing-mentor-notification-bell",
    route: "/mentor",
    role: "mentor",
    target: "notification-bell",
    title: "Notifications fired",
    body: "Marina scheduled a meeting and submitted a task — both fired notifications to the mentor. The bell shows unread items. Click it to open the inbox.",
    waitForClickTarget: "notification-bell",
  },
  {
    id: "closing-mentor-notification-item",
    route: "/mentor",
    role: "mentor",
    target: "notifications-first-item",
    title: "Each notification is a shortcut",
    body: "Clicking a notification routes straight to the related task, signal, or meeting — no hunting through tabs. Mentor and newcomer share the same notification spine.",
  },
  {
    id: "closing-nav-mentor-kanban",
    route: "/mentor",
    role: "mentor",
    target: "nav-mentor-kanban",
    title: "Open the mentor Kanban",
    body: "Open the mentor task board from the sidebar. This is the operations cockpit across every newcomer.",
    waitForClickTarget: "nav-mentor-kanban",
  },
  {
    id: "closing-mentor-in-review",
    route: "/mentor/kanban",
    role: "mentor",
    target: "mentor-kanban-column-in_review",
    title: "The review queue",
    body: "Every newcomer submission lands in this In review column — sorted by urgency, with AI signal markers. Marina's just-submitted task is here.",
  },
  {
    id: "closing-mentor-open-review-task",
    route: "/mentor/kanban",
    role: "mentor",
    target: "mentor-kanban-in-review-task",
    title: "Open the submission",
    body: "Click the highlighted card to open the review sheet. The mentor sees the task, the conversation, prior signals, and review history — everything to decide in seconds.",
    waitForClickTarget: "mentor-kanban-in-review-task",
  },
  {
    id: "closing-mentor-approve",
    route: "/mentor/kanban",
    role: "mentor",
    target: "mentor-task-approve",
    title: "Approve in one click",
    body: "Click Approve. The task moves to Done in both boards, Marina is notified, and her Progress page updates instantly. The full submit → review → approve loop is closed.",
    waitForClickTarget: "mentor-task-approve",
    advanceDelayAfterClick: 1200,
  },
  {
    id: "closing-final-board",
    route: "/mentor/kanban",
    role: "mentor",
    target: "mentor-kanban-board",
    title: "The full loop, in one tour",
    body: "Setup → plan → grounded knowledge → courses → signals → adjustments → new hire onboarded → daily rhythm → submit → approve. Mentor and newcomer always on the same surface, AI doing the heavy lifting, humans deciding.",
  },
];

export function getDemoTourStepSummaries(): DemoTourStepSummary[] {
  return TOUR_STEPS.map((step, index) => ({
    index,
    id: step.id,
    title: step.title,
    route: step.route,
    role: step.role,
  }));
}

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
  const filledStepRef = React.useRef<string | null>(null);
  const pendingClickAdvanceRef = React.useRef<string | null>(null);

  const step = TOUR_STEPS[guidedDemoStep] ?? null;
  const targetPath = step ? pathOnly(step.route) : "/";
  const onTargetRoute = step ? routeMatches(pathname, targetPath, step.routeMatch) : false;

  const completeStep = React.useCallback(
    (options?: { clickTarget?: boolean; delay?: number }) => {
      if (!step) return;
      pendingClickAdvanceRef.current = step.id;

      if (options?.clickTarget && step.waitForClickTarget) {
        const element = findDemoElement(step.waitForClickTarget);
        if (element) activateDemoElement(element);
      }

      window.setTimeout(() => {
        pendingClickAdvanceRef.current = null;
        if (guidedDemoStep >= TOUR_STEPS.length - 1) {
          stopGuidedDemo();
          return;
        }
        const nextIndex = guidedDemoStep + 1;
        const nextStep = TOUR_STEPS[nextIndex];
        setGuidedDemoStep(nextIndex);
        if (nextStep) {
          setRole(nextStep.role);
          if (
            nextStep.autoNavigate !== false &&
            nextStep.routeMatch !== "prefix" &&
            typeof window !== "undefined" &&
            window.location.pathname !== pathOnly(nextStep.route)
          ) {
            router.push(nextStep.route);
          }
        }
      }, options?.delay ?? step.advanceDelayAfterClick ?? 650);
    },
    [guidedDemoStep, router, setGuidedDemoStep, setRole, step, stopGuidedDemo],
  );

  React.useEffect(() => {
    pendingClickAdvanceRef.current = null;
  }, [step?.id]);

  React.useEffect(() => {
    if (!guidedDemoActive) return;
    if (!step) {
      stopGuidedDemo();
      return;
    }
    if (pendingClickAdvanceRef.current === step.id) return;
    setRole(step.role);
    if (!onTargetRoute && step.autoNavigate !== false && step.routeMatch !== "prefix") {
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
    if (!guidedDemoActive || !step || !onTargetRoute || !targetReady || paused) return;
    if (!step.fill?.length) return;
    if (filledStepRef.current === step.id) return;

    const timer = window.setTimeout(() => {
      step.fill?.forEach(({ target, value }) => fillDemoValue(target, value));
      filledStepRef.current = step.id;
    }, 520);

    return () => window.clearTimeout(timer);
  }, [guidedDemoActive, onTargetRoute, paused, step, targetReady]);

  React.useEffect(() => {
    if (!guidedDemoActive || !step?.waitForClickTarget || paused) return;

    const handleInteraction = (event: MouseEvent | PointerEvent) => {
      if (pendingClickAdvanceRef.current === step.id) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const clickedTarget = closestDemoElement(target, step.waitForClickTarget!);
      if (!clickedTarget) return;
      completeStep();
    };

    document.addEventListener("pointerdown", handleInteraction, true);
    document.addEventListener("click", handleInteraction, true);
    return () => {
      document.removeEventListener("pointerdown", handleInteraction, true);
      document.removeEventListener("click", handleInteraction, true);
    };
  }, [completeStep, guidedDemoActive, paused, step]);

  if (!guidedDemoActive || !step) return null;

  const panel = getPanelPosition(targetRect);
  const arrow = getArrowPosition(targetRect);
  const current = guidedDemoStep + 1;
  const total = TOUR_STEPS.length;
  const waitingForClick = !!step.waitForClickTarget;
  const canAdvance = onTargetRoute && targetReady && !paused;

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
            {waitingForClick ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--color-primary-active)]">
                  <MousePointerClick className="h-3.5 w-3.5" /> click target
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => completeStep({ delay: 0 })}
                  title="Skip without clicking the target"
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => completeStep({ clickTarget: true })}
                >
                  Do it
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant={canAdvance ? "ai" : "outline"}
                onClick={() => completeStep({ delay: 0 })}
                title={!canAdvance ? "Skip ahead without waiting for the target" : undefined}
              >
                {!canAdvance
                  ? "Skip step"
                  : guidedDemoStep >= TOUR_STEPS.length - 1
                    ? "Finish"
                    : "Next"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function pathOnly(route: string): string {
  return route.split("?")[0] || "/";
}

function routeMatches(pathname: string, route: string, mode: "exact" | "prefix" = "exact"): boolean {
  return mode === "prefix" ? pathname.startsWith(route) : pathname === route;
}

function demoSelector(id: string): string {
  return `[data-demo-id="${id}"],[data-demo-alt-id~="${id}"]`;
}

function findDemoElement(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(demoSelector(id));
}

function closestDemoElement(element: Element, id: string): Element | null {
  return element.closest(demoSelector(id));
}

function activateDemoElement(element: HTMLElement) {
  const pointerInit: PointerEventInit = {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: "mouse",
    button: 0,
    buttons: 1,
    isPrimary: true,
  };
  if (typeof window.PointerEvent === "function") {
    element.dispatchEvent(new PointerEvent("pointerdown", pointerInit));
    element.dispatchEvent(new PointerEvent("pointerup", { ...pointerInit, buttons: 0 }));
  } else {
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, buttons: 1 }));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0, buttons: 0 }));
  }
  element.click();
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
  const height = 230;
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
