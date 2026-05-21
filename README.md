<p align="center">
  <img src="docs/logo.svg" alt="ReadySet.AI" width="320" />
</p>

<h1 align="center" style="color:#CC5500">ReadySet.AI — Onboarding Service · Frontend</h1>

<p align="center">
  <a href="https://github.com/mad-futurist/ai-onboarding-service-frontend"><img alt="frontend" src="https://img.shields.io/badge/Frontend-Next.js%2016-CC5500?style=for-the-badge&labelColor=3D2000"/></a>
  <a href="https://github.com/mad-futurist/ai-onboarding-service"><img alt="backend" src="https://img.shields.io/badge/Backend-FastAPI-FF8C00?style=for-the-badge&labelColor=3D2000"/></a>
  <a href="https://ai-onboarding-service-frontend.vercel.app"><img alt="live" src="https://img.shields.io/badge/Live-Vercel-FFAA55?style=for-the-badge&labelColor=3D2000"/></a>
</p>

<p align="center">
  <b>Frontend repo:</b> <a href="https://github.com/mad-futurist/ai-onboarding-service-frontend">github.com/mad-futurist/ai-onboarding-service-frontend</a><br/>
  <b>Backend repo:</b> <a href="https://github.com/mad-futurist/ai-onboarding-service">github.com/mad-futurist/ai-onboarding-service</a><br/>
  <b>Live app:</b> <a href="https://ai-onboarding-service-frontend.vercel.app">ai-onboarding-service-frontend.vercel.app</a>
</p>

---

> **ReadySet.AI** is a web application that turns new-hire onboarding into a guided journey grounded in the company's real documentation. The mentor cockpit generates, tracks, and adjusts plans. The newcomer workspace shows only what matters today, with source-cited answers. ReadySet.AI reduces onboarding from a static checklist into an adaptive AI-guided workflow where mentors approve, newcomers execute, and AI detects friction before it becomes a blocker.

This repository contains the **Next.js frontend**. The FastAPI backend lives in [`ai-onboarding-service`](https://github.com/mad-futurist/ai-onboarding-service).

---
## 🌍 Languages

- [Українська версія](README.uk.md)

---

## 🎬 Run the demo first

> **Do this first** — go to ai-onboarding-service-frontend.vercel.app -> Open the **Demo** page in the sidebar(bottom) and click **"Start demo mode"**.

The guided demo:

- places **spotlight overlays**, highlights the next control, and fills forms with realistic data;
- **never clicks for you** — you stay in control; a *Do it* button performs the highlighted action if you want;
- covers the **5 acts** of the product (mentor setup → newcomer daily life → signals & adjustments → courses & new hire → daily rhythm & review loop);
- lets you **jump to any step** from `/demo`.

If a page looks empty after a deep jump, go to *Settings → Regenerate database*.

---

## 🎯 Product / Use Case

ReadySet.AI is an AI onboarding cockpit for role-specific employee onboarding.

The product helps mentors, team leads, sales managers, and technical leads onboard new hires faster by turning company knowledge, HR processes, sales playbooks, technical documentation, product documentation, and internal workflows into a guided onboarding journey.

ReadySet.AI is not limited to one department. It adapts the onboarding path to the newcomer’s role.

In the demo, the main story focuses on **Oleg onboarding Marina into the sales team**, while the product also supports technical onboarding for profiles such as **Backend Developers**.

For example:

- a **Sales newcomer** gets sales process tasks, CRM guidance, HR/process courses, product knowledge, customer-facing playbooks, and sales workflow support;
- a **Backend Developer** gets environment setup, architecture documentation, codebase walkthroughs, deployment guides, PR/review workflows, testing practices, and technical Ask AI support.

Instead of giving newcomers a static checklist or a folder full of documents, ReadySet.AI creates a role-specific 30/60/90-day plan, answers questions with sources, detects onboarding friction, generates short courses, and keeps the mentor in control.

### Main demo use case

Oleg, a Sales Team Lead, needs to onboard Marina into the sales team.

Marina is new. She needs to understand the company, the sales process, HR basics, internal tools, product knowledge, and what she should do every day without being overwhelmed.

Oleg uses ReadySet.AI to:

- ground the onboarding in the company knowledge base;
- generate Marina's 30/60/90-day onboarding plan;
- approve AI-generated tasks period by period;
- monitor Marina's progress and AI signals;
- detect blockers even when the newcomer does not explicitly ask for help;
- create short HR/process courses from selected sources;
- onboard an additional newcomer, Noa Benali, in minutes;
- review submitted tasks from the shared Kanban surface.

The core principle is:

> AI does the heavy lifting. Humans stay in control.

---

## 🧭 Demo Flow

The demo follows one realistic sales onboarding story: **Oleg onboards Marina into the sales team**.

### Act 1 — Setup

Oleg opens the mentor cockpit, connects the onboarding workspace to the company knowledge base, and generates Marina's 30/60/90-day plan with the AI Plan Generator.

The plan is generated period by period, based on selected sources, and requires mentor approval.

**Screens shown:**

- Mentor Cockpit
- Knowledge Base
- AI Plan Generator

**What this proves:**

The operating center and the onboarding journey are in place.

---

### Act 2 — Marina's daily life

The demo switches into Marina's newcomer workspace.

Marina opens her plan, picks a task, chats with task-context AI, then reads a grounded HR/process document with a mind map and source-cited answers.

She does not receive a generic course or a huge document dump. She sees what matters today.

**Screens shown:**

- Newcomer Home
- My Plan
- Ask AI

**What this proves:**

The newcomer gets a personalized daily path with grounded AI help.

---

### Act 3 — Signals & adjustments

The demo switches back to Oleg.

AI flags that another newcomer, Tanya, needs attention with evidence: repeated questions, blocked tasks, and review patterns. Oleg opens the signal, regenerates a targeted plan change, edits a precise task, and applies the adjustment.

**Screens shown:**

- Signals Center
- Signal Detail
- Plan Adjustment

**What this proves:**

AI proposes, the mentor decides. Friction is caught early, even when a newcomer is too shy or too unsure to ask directly.

---

### Act 4 — Author courses & onboard a new hire

Oleg drafts a short HR/process course from selected sources. He reviews and approves it.

Then he adds a brand-new hire, Noa Benali, generates a two-question skill check, and Noa takes the test. The result triggers plan generation in the background.

**Screens shown:**

- Courses
- Add Newcomer
- Skill Check
- AI Plan Generation

**What this proves:**

The system scales onboarding. Courses and newcomer journeys can be prepared in minutes, not days.

---

### Act 5 — Daily rhythm & closing the loop

The demo switches back to Marina.

Notifications keep her in sync. The Progress page shows momentum. The Calendar lets her schedule a weekly sync. Her Kanban lets her submit a task for review.

Then the demo switches back to Oleg. The same task appears in his mentor review queue, and he approves it in one click.

**Screens shown:**

- Notifications
- Progress
- Calendar
- Newcomer Kanban
- Mentor Kanban

**What this proves:**

Both sides share the same onboarding surface. AI accelerates the workflow, but humans validate important decisions.

---

## 🧠 Why AI is central

ReadySet.AI is not a classic onboarding checklist with a chatbot added on top.

AI is the operating layer of the product.

It drives the full onboarding loop:

```text
Company knowledge + newcomer profile
        ↓
AI-generated 30/60/90 plan
        ↓
Mentor review and approval
        ↓
Newcomer daily execution
        ↓
Grounded AI answers with sources
        ↓
Signals from questions, blocked tasks, and review patterns
        ↓
AI-generated plan adjustments and course suggestions
        ↓
Mentor validates
        ↓
Better onboarding path
```

**AI is used to:**

* generate personalized onboarding plans;
* transform internal knowledge into actionable tasks;
* answer newcomer questions with source citations;
* detect onboarding friction from behavioral signals;
* suggest mentor interventions;
* generate short courses from company documents;
* adapt the plan when the newcomer gets blocked or progresses faster than expected.

**The product principle is:**

AI proposes. Mentor decides. Newcomer progresses with context.

---

## 💼 Why ReadySet.AI matters for Oleg

For Oleg, ReadySet.AI reduces the operational load of onboarding.

Without ReadySet.AI, Oleg has to manually explain processes, collect documents, create onboarding tasks, repeat the same answers, monitor progress informally, and notice blockers too late.

With ReadySet.AI, Oleg gets:

- faster onboarding plan generation;
- less manual preparation of courses and documents;
- AI-generated 30/60/90 plans grounded in company knowledge;
- mentor approval before AI output affects the newcomer;
- visibility into progress, blocked tasks, and submitted work;
- AI signals when a newcomer may be struggling;
- evidence behind every signal, not black-box scoring;
- a shared Kanban surface for task submission and review;
- reusable onboarding flows for future hires.

Most importantly, ReadySet.AI helps Oleg detect the invisible onboarding problem:

> Some newcomers do not ask questions because they do not want to look weak, or because they do not know what they do not know.

AI signals help Oleg intervene earlier, with context.
---
## 👤 Why ReadySet.AI matters for Marina

For Marina, ReadySet.AI makes onboarding focused, guided, and less stressful.

Instead of receiving too much information at once, Marina gets:

- a personalized onboarding plan;
- daily tasks that match her role and current stage;
- clear explanations of what to do next;
- AI answers grounded in company documents;
- source citations, so she can trust and verify the answer;
- task-context AI help when she is working on something specific;
- HR/process guidance without needing to ask basic questions publicly;
- visible progress and momentum;
- notifications and calendar support to stay aligned with Oleg.

ReadySet.AI also helps with the “I don’t know what I don’t know” problem.

Marina may not always realize that she is missing context. The system can detect repeated questions, blocked tasks, or friction patterns and surface them to the mentor as signals.

This makes onboarding safer:

- Marina is not left alone with uncertainty;
- Oleg gets evidence before the problem becomes serious;
- the plan can be adjusted instead of staying static.

---

## ⚡ Killer Features

| # | Feature | Why it matters |
|---|---|---|
| 1 | **AI Plan Generator** | Generates Marina's personalized 30/60/90-day onboarding plan from selected company sources. |
| 2 | **Human-in-the-loop approval** | Oleg reviews and approves plans, courses, signals, and adjustments before they affect the newcomer. |
| 3 | **Grounded Ask AI** | Marina can ask questions about HR, sales processes, tools, or tasks and receive source-cited answers. |
| 4 | **Task-context AI** | AI help is connected to the task Marina is currently working on. |
| 5 | **AI Signals Center** | Oleg sees evidence-backed alerts when a newcomer shows friction through questions, blocked tasks, or review patterns. |
| 6 | **Adaptive plan adjustments** | AI proposes targeted changes to the onboarding plan, but Oleg can edit and approve them. |
| 7 | **AI Course Authoring** | Oleg can generate short HR/process courses from selected sources and approve them before publishing. |
| 8 | **Skill check → plan generation** | Noa takes a short skill check, and the system uses the result to generate a better onboarding path. |
| 9 | **Shared Kanban review loop** | Marina submits a task from her Kanban; Oleg sees the same task in his review queue and approves it. |

---

## 🧩 Classic features

- **Kanban board** — mentor and newcomer share the same task objects through two role-tailored surfaces.
- **Progress tracking** — momentum, phase completion, weekly snapshots, end-of-onboarding report.
- **Document service** — ingestion, chunking, embeddings, semantic search, document recommendations.
- **Notifications** — in-app bell, unread states, role-scoped events.
- **Plan and task management** — phases, tasks, success criteria, submit → review loop.
- **Submit & approve** — newcomer submits, mentor approves in one click.

---

## ✨ Additional features

- **Calendar** — schedule 1:1 syncs and weekly check-ins, shared mentor ↔ newcomer.
- **Video integration in courses** — embed video lessons inside generated courses.
- **Teams / Slack integration** *(roadmap)* — Ask AI in-thread, notifications.
- **Mind map generation** — every Ask AI answer renders a `@xyflow/react` mind map of related concepts.
- **Color palette switching** — light, cream, dark — built around the ReadySet.AI brand tokens.
- **Live demo mode** — first-class guided tour, jump to any of 60+ steps.

---

## 🛠 Technical solutions

| Layer         | Tech |
| ------------- | ---- |
| Framework     | **Next.js 16** (App Router, route groups) + **React 19** |
| UI            | **Tailwind v4**, **Radix UI**, **Framer Motion**, sonner, lucide-react |
| State / data  | **TanStack Query**, **axios**, **zod**, **react-hook-form** |
| Visualization | **`@xyflow/react`** + **dagre** for plan graphs and mind maps |
| DnD           | `@dnd-kit/core` + `@dnd-kit/sortable` for Kanban |
| Auth/proxy    | Browser → Next.js → FastAPI (`/api` proxy) |
| Demo runtime  | Custom `GuidedDemoTour` with spotlight overlays, wait-for-click, deterministic `data-demo-id` selectors |
| i18n          | `src/i18n/messages.ts` — EN / UK |

**Architecture:** browser calls `/api/*` on the Next.js host, which proxies to the FastAPI backend. The frontend never holds the OpenAI key — every AI call goes through the backend's RAG pipeline (chunk retrieval → prompt assembly → LLM → structured output validated by zod on the client).

---

## 🎨 Brand palette

| Token | Hex | Usage |
|---|---|---|
| <kbd>&nbsp;Blaze Orange&nbsp;</kbd> | `#CC5500` | Primary CTA, "Ready" wordmark, checkmark |
| <kbd>&nbsp;Dark Orange&nbsp;</kbd> | `#FF8C00` | "Set" wordmark, progress bars, active states |
| <kbd>&nbsp;Sandy Orange&nbsp;</kbd> | `#FFAA55` | Hover states, badges, second-level icons |
| <kbd>&nbsp;Peach&nbsp;</kbd> | `#FFD199` | Highlighted block backgrounds, low-priority notifications |
| <kbd>&nbsp;Cream&nbsp;</kbd> | `#FFF0E0` | Card backgrounds, onboarding sections |
| <kbd>&nbsp;Warm White&nbsp;</kbd> | `#FFF7F0` | Page background |
| <kbd>&nbsp;Warm Brown&nbsp;</kbd> | `#7A5030` | Body text, captions |
| <kbd>&nbsp;Deep Brown&nbsp;</kbd> | `#3D2000` | Headings, card borders |
| <kbd>&nbsp;Obsidian&nbsp;</kbd> | `#1A0E00` | Dark-mode navbar, premium UI |

---

## 🚀 Run locally

### 1. Backend (`../ai-onboarding-service`)

```powershell
cd ..\ai-onboarding-service

docker compose up -d                       # Postgres + pgvector
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

cp .env.example .env                       # fill DATABASE_URL, OPENAI_API_KEY, ...
alembic upgrade head
uvicorn app.main:app --reload              # http://127.0.0.1:8000
```

### 2. Frontend (this repo)

```powershell
cd frontend
npm install
cp .env.example .env.local                 # defaults to local backend
npm run dev                                # http://localhost:3000
```

Open [http://localhost:3000/demo](http://localhost:3000/demo) and click **Start demo mode**.

---

## 🌍 Run in production

### Frontend → **Vercel**
1. Import the repo into Vercel, root directory `frontend`.
2. Build command: `next build`.
3. Env vars:
   ```
   NEXT_PUBLIC_API_BASE=/api
   BACKEND_URL=https://ai-onboarding-service.onrender.com
   NEXT_PUBLIC_BACKEND_URL=https://ai-onboarding-service.onrender.com
   ```
4. Live URL: [ai-onboarding-service-frontend.vercel.app](https://ai-onboarding-service-frontend.vercel.app).

### Backend → **Render**
Python Web Service. See the [backend README](https://github.com/mad-futurist/ai-onboarding-service#run-in-production) for full env vars and migration steps.

---

## 📁 Repo structure

```
frontend/
├── src/app/(app)/           # mentor/*, newcomer/*, demo/*
├── src/components/
│   ├── demo/                # GuidedDemoTour, spotlight, fill helpers
│   ├── mentor/              # cockpit, plan-generator, kanban, signals
│   ├── newcomer/            # plan, kanban, ask, progress, calendar
│   ├── ai/                  # AIInsightCard, sourced answers, mind map
│   └── ui/                  # Radix + Tailwind primitives
├── src/providers/           # demo-provider, role provider, query client
├── src/i18n/messages.ts     # EN/UK strings
└── docs/logo.svg
```

---

## 📜 Scripts

```powershell
npm run dev      # dev server
npm run build    # prod build
npm run start    # serve prod build
npm run lint     # eslint
```

---
