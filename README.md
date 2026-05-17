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

> **ReadySet.AI** is a web application that turns new-hire onboarding into a guided journey grounded in the company's real documentation. The mentor cockpit generates, tracks, and adjusts plans. The newcomer workspace shows only what matters today, with source-cited answers.

This repository contains the **Next.js frontend**. The FastAPI backend lives in [`ai-onboarding-service`](https://github.com/mad-futurist/ai-onboarding-service).

---

## 🎬 Run the demo first

> **Do this first** — most screens look empty otherwise. Open the **Demo** page in the sidebar and click **"Start demo mode"**.

The guided demo:

- places **spotlight overlays**, highlights the next control, and fills forms with realistic data;
- **never clicks for you** — you stay in control; a *Do it* button performs the highlighted action if you want;
- covers the **5 acts** of the product (mentor setup → newcomer daily life → signals & adjustments → courses & new hire → daily rhythm & review loop);
- lets you **jump to any step** from `/demo`.

If a page looks empty after a deep jump, go to *Settings → Regenerate database*.

---

## ⚡ Killer features

| # | Feature | Why it matters |
|---|---|---|
| 1 | **AI Copilot under human control** | Every AI output (plan, course, signal, adjustment) is an editable artifact that requires explicit mentor approval. *AI proposes — mentor decides.* No silent auto-apply, no hallucination shipped to the newcomer. |
| 2 | **AI live** | Streaming AI surfaces — plan generation, Ask AI answers, signal explanations all stream live with token-by-token feedback. |
| 3 | **Plan generation for role & documents** | The plan is built phase by phase from the newcomer's role + the selected knowledge-base documents. Targeted, not generic. |
| 4 | **Listening signals → role + questioning first** | The system listens: it starts from the role profile, then from the newcomer's own questions, blocked tasks and review patterns. Signals are evidence-backed (3 repeated questions, 2 tasks blocked 4 days), not opaque scores. |
| 5 | **AI signals with proof** | Every alert shows *why* it fired — the mentor can judge instead of trusting a black box. |
| 6 | **Course generation with control** | Mentor picks the sources, AI drafts a short course, mentor reviews and approves before publish. |
| 7 | **RAG Ask AI** | Every answer is grounded on document chunks (pgvector + OpenAI embeddings) with inline source citations. An answer without a source is not shown. |

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
---

<p align="center">
  <img src="docs/logo.svg" alt="ReadySet.AI" width="320" />
</p>

<h1 align="center" style="color:#CC5500">ReadySet.AI — Сервіс онбордингу · Frontend</h1>

<p align="center">
  <b>Frontend репо:</b> <a href="https://github.com/mad-futurist/ai-onboarding-service-frontend">github.com/mad-futurist/ai-onboarding-service-frontend</a><br/>
  <b>Backend репо:</b> <a href="https://github.com/mad-futurist/ai-onboarding-service">github.com/mad-futurist/ai-onboarding-service</a><br/>
  <b>Live:</b> <a href="https://ai-onboarding-service-frontend.vercel.app">ai-onboarding-service-frontend.vercel.app</a>
</p>

---

> **ReadySet.AI** — це вебдодаток, що перетворює онбординг нового співробітника на керовану подорож, яка ґрунтується на реальній документації компанії. Кокпіт ментора генерує, відстежує та коригує плани. Простір новачка показує лише те, що важливо сьогодні, з відповідями, підкріпленими джерелами.

Цей репозиторій містить **frontend на Next.js**. Бекенд на FastAPI — [`ai-onboarding-service`](https://github.com/mad-futurist/ai-onboarding-service).

---

## 🎬 Спочатку запустіть демо

> **Зробіть це першим** — інакше більшість екранів виглядатимуть порожньо. Відкрийте **Demo** у бічній панелі та натисніть **«Start demo mode»**.

Керований демо-режим:

- накладає **spotlight-оверлеї**, підсвічує наступний елемент і заповнює форми реалістичними даними;
- **ніколи не клікає за вас** — кнопка *Do it* виконує підсвічену дію за бажанням;
- покриває **5 актів** продукту (налаштування ментора → щоденне життя новачка → сигнали → курси та новий найм → щоденний ритм і цикл рев'ю);
- дозволяє **перейти до будь-якого кроку** з `/demo`.

Якщо після глибокого переходу сторінка порожня — *Settings → Regenerate database*.

---

## ⚡ Killer-функції

| # | Функція | Чому це важливо |
|---|---|---|
| 1 | **AI-копілот під контролем людини** | Кожен вихід ШІ (план, курс, сигнал, коригування) — це редагований артефакт, який вимагає явного схвалення ментора. *ШІ пропонує — ментор вирішує.* |
| 2 | **AI live** | Стрімінгові AI-поверхні — генерація планів, відповіді Ask AI та пояснення сигналів стрімляться токен за токеном. |
| 3 | **Генерація плану під роль і документи** | План будується фаза за фазою з ролі новачка + обраних документів бази знань. |
| 4 | **Сигнали слухають: спочатку роль, потім запитання** | Система слухає: стартує з профілю ролі, далі — з власних запитань новачка, заблокованих задач, патернів рев'ю. Сигнали з доказами, не з непрозорими балами. |
| 5 | **AI-сигнали з доказами** | Кожен алерт показує *чому* він спрацював. |
| 6 | **Генерація курсів із контролем** | Ментор обирає джерела, ШІ пише короткий курс, ментор перевіряє та публікує. |
| 7 | **RAG Ask AI** | Кожна відповідь ґрунтується на чанках документів (pgvector + OpenAI embeddings) з цитуванням джерел. Відповідь без джерела не показується. |

---

## 🧩 Класичні функції

- **Kanban-дошка** — ментор і новачок працюють з одними задачами через дві адаптовані поверхні.
- **Відстеження прогресу** — momentum, виконання фаз, тижневі снапшоти, звіт у кінці.
- **Document service** — інжест, chunking, embeddings, семантичний пошук.
- **Нотифікації** — bell, статуси, події в межах ролі.
- **Управління планом і задачами** — фази, критерії успіху, submit → review.

---

## ✨ Додаткові функції

- **Календар** — заплановані 1:1 і щотижневі сесії, спільні mentor ↔ newcomer.
- **Інтеграція відео у курси** — вбудовування відеоуроків.
- **Інтеграція Teams / Slack** *(roadmap)*.
- **Генерація mind map** — кожна відповідь Ask AI рендерить мейнд-карту через `@xyflow/react`.
- **Зміна палітри** — світла, кремова, темна — на основі бренд-токенів.
- **Live-демо** — first-class керований тур, перехід до будь-якого з 60+ кроків.

---

## 🛠 Технічні рішення

| Шар           | Технології |
| ------------- | ---------- |
| Framework     | **Next.js 16** (App Router) + **React 19** |
| UI            | **Tailwind v4**, **Radix UI**, **Framer Motion**, sonner, lucide-react |
| Дані          | **TanStack Query**, **axios**, **zod**, **react-hook-form** |
| Візуалізація  | **`@xyflow/react`** + **dagre** для графів плану та мейнд-карт |
| DnD           | `@dnd-kit/core` + `@dnd-kit/sortable` для Kanban |
| Auth/proxy    | Browser → Next.js → FastAPI (`/api` proxy) |
| Демо-рантайм  | Власний `GuidedDemoTour` зі spotlight-оверлеями та `data-demo-id` |
| i18n          | `src/i18n/messages.ts` — EN / UK |

**Архітектура:** браузер викликає `/api/*` на Next.js-хості, який проксує до FastAPI-бекенду. Frontend ніколи не тримає OpenAI-ключ — усі AI-виклики йдуть через RAG-пайплайн бекенду.

---

## 🎨 Бренд-палітра

| Токен | Hex | Використання |
|---|---|---|
| <kbd>&nbsp;Blaze Orange&nbsp;</kbd> | `#CC5500` | Основний CTA, "Ready", чекмарк |
| <kbd>&nbsp;Dark Orange&nbsp;</kbd> | `#FF8C00` | "Set", прогрес-бари, активні стани |
| <kbd>&nbsp;Sandy Orange&nbsp;</kbd> | `#FFAA55` | Hover, бейджі, іконки 2-го рівня |
| <kbd>&nbsp;Peach&nbsp;</kbd> | `#FFD199` | Фон виділених блоків |
| <kbd>&nbsp;Cream&nbsp;</kbd> | `#FFF0E0` | Фон карток |
| <kbd>&nbsp;Warm White&nbsp;</kbd> | `#FFF7F0` | Фон сторінки |
| <kbd>&nbsp;Warm Brown&nbsp;</kbd> | `#7A5030` | Основний текст |
| <kbd>&nbsp;Deep Brown&nbsp;</kbd> | `#3D2000` | Заголовки, межі карток |
| <kbd>&nbsp;Obsidian&nbsp;</kbd> | `#1A0E00` | Dark navbar, преміальний UI |

---

## 🚀 Локальний запуск

Див. розділ **Run locally** вище — команди ідентичні.

## 🌍 Продакшен

Vercel (frontend) + Render (backend). Див. розділ **Run in production** вище та [README бекенду](https://github.com/mad-futurist/ai-onboarding-service#run-in-production).
