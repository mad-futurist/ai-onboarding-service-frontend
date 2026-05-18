<p align="center">
  <img src="docs/logo.svg" alt="ReadySet.AI" width="320" />
</p>

<h1 align="center" style="color:#CC5500">ReadySet.AI — Сервіс онбордингу · Frontend</h1>

<p align="center">
  <a href="https://github.com/mad-futurist/ai-onboarding-service-frontend"><img alt="frontend" src="https://img.shields.io/badge/Frontend-Next.js%2016-CC5500?style=for-the-badge&labelColor=3D2000"/></a>
  <a href="https://github.com/mad-futurist/ai-onboarding-service"><img alt="backend" src="https://img.shields.io/badge/Backend-FastAPI-FF8C00?style=for-the-badge&labelColor=3D2000"/></a>
  <a href="https://ai-onboarding-service-frontend.vercel.app"><img alt="live" src="https://img.shields.io/badge/Live-Vercel-FFAA55?style=for-the-badge&labelColor=3D2000"/></a>
</p>

<p align="center">
  <b>Frontend репозиторій:</b> <a href="https://github.com/mad-futurist/ai-onboarding-service-frontend">github.com/mad-futurist/ai-onboarding-service-frontend</a><br/>
  <b>Backend репозиторій:</b> <a href="https://github.com/mad-futurist/ai-onboarding-service">github.com/mad-futurist/ai-onboarding-service</a><br/>
  <b>Live app:</b> <a href="https://ai-onboarding-service-frontend.vercel.app">ai-onboarding-service-frontend.vercel.app</a>
</p>

---

> **ReadySet.AI** — це вебзастосунок, який перетворює онбординг нового співробітника на керований шлях, заснований на реальній документації компанії. Mentor cockpit генерує, відстежує та адаптує плани. Newcomer workspace показує лише те, що важливо сьогодні, з відповідями, підкріпленими джерелами.

ReadySet.AI перетворює онбординг зі статичного checklist у адаптивний AI-guided workflow, де ментори затверджують, новачки виконують, а AI виявляє friction до того, як він стане blocker.

Цей репозиторій містить **Next.js frontend**. Backend на FastAPI знаходиться в [`ai-onboarding-service`](https://github.com/mad-futurist/ai-onboarding-service).

---

## 🎬 Спочатку запустіть демо

> **Зробіть це першим** — Відкрийте сторінку **Demo** у sidebar і натисніть **"Start demo mode"**.

Guided demo:

- додає **spotlight overlays**, підсвічує наступний control і заповнює форми реалістичними даними;
- **ніколи не клікає замість вас** — кнопка *Do it* виконує підсвічену дію, якщо ви хочете;
- покриває **5 актів** продукту: mentor setup → newcomer daily life → signals & adjustments → courses & new hire → daily rhythm & review loop;
- дозволяє **перейти до будь-якого кроку** з `/demo`.

Якщо після переходу на певний step сторінка виглядає порожньою, відкрийте *Settings → Regenerate database*.

---

## 🎯 Продукт / Use Case

ReadySet.AI — це AI onboarding cockpit для рольового онбордингу співробітників.

Продукт допомагає менторам, team leads, sales managers і technical leads швидше онбордити нових співробітників, перетворюючи company knowledge, HR processes, sales playbooks, technical documentation, product documentation та internal workflows у керований onboarding journey.

ReadySet.AI не обмежується одним департаментом. Система адаптує onboarding path під роль newcomer.

У демо основна історія сфокусована на тому, як **Oleg онбордить Marina у sales team**, але продукт також підтримує technical onboarding для профілів на кшталт **Backend Developers**.

Наприклад:

- **Sales newcomer** отримує sales process tasks, CRM guidance, HR/process courses, product knowledge, customer-facing playbooks і sales workflow support;
- **Backend Developer** отримує environment setup, architecture documentation, codebase walkthroughs, deployment guides, PR/review workflows, testing practices і technical Ask AI support.

Замість того, щоб давати newcomer статичний checklist або папку з десятками документів, ReadySet.AI створює рольовий 30/60/90-day plan, відповідає на питання з джерелами, виявляє onboarding friction, генерує короткі курси й залишає контроль за ментором.

### Основний demo use case

Oleg, Sales Team Lead, має онбордити Marina у sales team.

Marina нова в команді. Їй потрібно зрозуміти компанію, sales process, HR basics, internal tools, product knowledge і що саме робити кожного дня без інформаційного перевантаження.

Oleg використовує ReadySet.AI, щоб:

- прив’язати onboarding до company knowledge base;
- згенерувати Marina's 30/60/90-day onboarding plan;
- затвердити AI-generated tasks період за періодом;
- відстежувати Marina's progress і AI signals;
- виявляти blockers навіть тоді, коли newcomer не просить допомоги напряму;
- створювати короткі HR/process courses з вибраних джерел;
- онбордити додаткового newcomer, Noa Benali, за кілька хвилин;
- перевіряти submitted tasks через shared Kanban surface.

Основний принцип продукту:

> AI does the heavy lifting. Humans stay in control.

---

## 🧭 Demo Flow

Демо показує одну реалістичну sales onboarding історію: **Oleg онбордить Marina у sales team**.

### Act 1 — Setup

Oleg відкриває mentor cockpit, підключає onboarding workspace до company knowledge base і генерує Marina's 30/60/90-day plan через AI Plan Generator.

План генерується період за періодом, базується на вибраних джерелах і потребує mentor approval.

**Екрани:**

- Mentor Cockpit
- Knowledge Base
- AI Plan Generator

**Що це доводить:**

Операційний центр і onboarding journey готові до роботи.

---

### Act 2 — Marina's daily life

Демо перемикається у Marina's newcomer workspace.

Marina відкриває свій план, вибирає задачу, спілкується з task-context AI, а потім читає grounded HR/process document з mind map і source-cited answers.

Вона не отримує generic course або величезний document dump. Вона бачить лише те, що важливо сьогодні.

**Екрани:**

- Newcomer Home
- My Plan
- Ask AI

**Що це доводить:**

Newcomer отримує personalized daily path з grounded AI help.

---

### Act 3 — Signals & adjustments

Демо повертається до Oleg.

AI сигналізує, що інший newcomer, Tanya, потребує уваги, на основі evidence: repeated questions, blocked tasks і review patterns. Oleg відкриває signal, регенерує targeted plan change, редагує конкретну задачу й застосовує adjustment.

**Екрани:**

- Signals Center
- Signal Detail
- Plan Adjustment

**Що це доводить:**

AI proposes, mentor decides. Friction виявляється рано, навіть якщо newcomer соромиться або не знає, як попросити допомогу.

---

### Act 4 — Author courses & onboard a new hire

Oleg генерує короткий HR/process course з вибраних джерел. Він переглядає його й затверджує.

Потім він додає нового співробітника, Noa Benali, генерує two-question skill check, і Noa проходить тест. Результат запускає plan generation у background.

**Екрани:**

- Courses
- Add Newcomer
- Skill Check
- AI Plan Generation

**Що це доводить:**

Система масштабує onboarding. Courses і newcomer journeys можна підготувати за хвилини, а не за дні.

---

### Act 5 — Daily rhythm & closing the loop

Демо повертається до Marina.

Notifications допомагають їй залишатися в синхроні. Progress page показує momentum. Calendar дозволяє запланувати weekly sync. Kanban дозволяє відправити задачу на review.

Потім демо повертається до Oleg. Та сама задача з’являється в mentor review queue, і він затверджує її в один клік.

**Екрани:**

- Notifications
- Progress
- Calendar
- Newcomer Kanban
- Mentor Kanban

**Що це доводить:**

Обидві сторони працюють в одному onboarding surface. AI прискорює workflow, але люди підтверджують важливі рішення.

---

## 🧠 Чому AI є центральним

ReadySet.AI — це не класичний onboarding checklist із chatbot зверху.

AI є operating layer продукту.

Він керує повним onboarding loop:

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

**AI використовується для того, щоб:**

- генерувати personalized onboarding plans;
- перетворювати internal knowledge на actionable tasks;
- відповідати на newcomer questions із source citations;
- виявляти onboarding friction через behavioral signals;
- пропонувати mentor interventions;
- генерувати короткі courses з company documents;
- адаптувати plan, коли newcomer блокується або рухається швидше, ніж очікувалось.

AI також адаптує onboarding journey під роль.

Один і той самий onboarding engine може генерувати різні шляхи залежно від newcomer profile і selected sources:

- **Sales onboarding:** CRM, sales scripts, lead qualification, HR processes, product pitch, pipeline rituals.
- **Backend onboarding:** local setup, architecture, APIs, database, deployment, testing, code review.
- **Manager onboarding:** team rituals, reporting, dashboards, stakeholder map, decision workflows.

Це робить ReadySet.AI reusable across teams, а не hardcoded tool для однієї функції.

**Принцип продукту:**

> AI proposes. Mentor decides. Newcomer progresses with context.

---

## 💼 Чому ReadySet.AI важливий для Oleg

Для Oleg ReadySet.AI зменшує операційне навантаження онбордингу.

Без ReadySet.AI Oleg має вручну пояснювати процеси, збирати документи, створювати onboarding tasks, повторювати ті самі відповіді, неформально моніторити progress і часто помічати blockers занадто пізно.

З ReadySet.AI Oleg отримує:

- швидшу генерацію onboarding plan;
- менше ручної підготовки courses і documents;
- AI-generated 30/60/90 plans, grounded in company knowledge;
- mentor approval до того, як AI output вплине на newcomer;
- видимість progress, blocked tasks і submitted work;
- AI signals, коли newcomer може мати труднощі;
- evidence behind every signal, а не black-box scoring;
- shared Kanban surface для task submission і review;
- reusable onboarding flows для майбутніх hires.

Найважливіше: ReadySet.AI допомагає Oleg бачити invisible onboarding problem:

> Деякі newcomers не ставлять питання, бо не хочуть виглядати слабкими або тому що не знають, чого саме вони не знають.

AI signals допомагають Oleg втрутитися раніше й уже з контекстом.

---

## 👤 Чому ReadySet.AI важливий для Marina

Для Marina ReadySet.AI робить onboarding сфокусованим, керованим і менш стресовим.

Замість того, щоб одразу отримати надто багато інформації, Marina отримує:

- personalized onboarding plan;
- daily tasks, які відповідають її ролі й поточному етапу;
- зрозумілі пояснення, що робити далі;
- AI answers, grounded in company documents;
- source citations, щоб вона могла довіряти відповіді й перевірити її;
- task-context AI help, коли вона працює над конкретною задачею;
- HR/process guidance без потреби публічно ставити базові питання;
- visible progress і momentum;
- notifications і calendar support, щоб залишатися синхронізованою з Oleg.

ReadySet.AI також допомагає з проблемою:

> I don't know what I don't know.

Marina не завжди може зрозуміти, що їй бракує контексту. Система може виявити repeated questions, blocked tasks або friction patterns і показати це ментору як signal.

Це робить onboarding безпечнішим:

- Marina не залишається сама з невизначеністю;
- Oleg отримує evidence до того, як проблема стане серйозною;
- plan можна адаптувати, а не залишати статичним.

---

## ⚡ Killer-функції

| # | Функція | Чому це важливо |
|---|---|---|
| 1 | **AI Plan Generator** | Генерує personalized 30/60/90-day onboarding plan для Marina на основі selected company sources. |
| 2 | **Human-in-the-loop approval** | Oleg перевіряє й затверджує plans, courses, signals і adjustments перед тим, як вони вплинуть на newcomer. |
| 3 | **Grounded Ask AI** | Marina може ставити питання про HR, sales processes, tools або tasks і отримувати source-cited answers. |
| 4 | **Task-context AI** | AI help прив'язана до задачі, над якою Marina працює прямо зараз. |
| 5 | **AI Signals Center** | Oleg бачить evidence-backed alerts, коли newcomer показує friction через questions, blocked tasks або review patterns. |
| 6 | **Adaptive plan adjustments** | AI пропонує targeted changes до onboarding plan, але Oleg може редагувати й затверджувати їх. |
| 7 | **AI Course Authoring** | Oleg може генерувати короткі HR/process courses з selected sources і затверджувати їх перед публікацією. |
| 8 | **Skill check → plan generation** | Noa проходить короткий skill check, і система використовує результат, щоб згенерувати кращий onboarding path. |
| 9 | **Shared Kanban review loop** | Marina submits a task from her Kanban; Oleg бачить ту саму задачу у review queue і затверджує її. |

---

## 🧩 Класичні функції

- **Kanban board** — mentor і newcomer працюють з одними task objects через дві role-tailored surfaces.
- **Progress tracking** — momentum, phase completion, weekly snapshots, end-of-onboarding report.
- **Document service** — ingestion, chunking, embeddings, semantic search, document recommendations.
- **Notifications** — in-app bell, unread states, role-scoped events.
- **Plan and task management** — phases, tasks, success criteria, submit → review loop.
- **Submit & approve** — newcomer submits, mentor approves in one click.

---

## ✨ Додаткові функції

- **Calendar** — планування 1:1 syncs і weekly check-ins, shared mentor ↔ newcomer.
- **Video integration in courses** — embed video lessons inside generated courses.
- **Teams / Slack integration** *(roadmap)* — Ask AI in-thread, notifications.
- **Mind map generation** — кожна Ask AI answer рендерить `@xyflow/react` mind map related concepts.
- **Color palette switching** — light, cream, dark — побудовано на ReadySet.AI brand tokens.
- **Live demo mode** — first-class guided tour, jump to any of 60+ steps.

---

## 🛠 Технічні рішення

| Шар | Технології |
| --- | --- |
| Framework | **Next.js 16** (App Router, route groups) + **React 19** |
| UI | **Tailwind v4**, **Radix UI**, **Framer Motion**, sonner, lucide-react |
| State / data | **TanStack Query**, **axios**, **zod**, **react-hook-form** |
| Visualization | **`@xyflow/react`** + **dagre** для plan graphs і mind maps |
| DnD | `@dnd-kit/core` + `@dnd-kit/sortable` для Kanban |
| Auth/proxy | Browser → Next.js → FastAPI (`/api` proxy) |
| Demo runtime | Custom `GuidedDemoTour` зі spotlight overlays, wait-for-click, deterministic `data-demo-id` selectors |
| i18n | `src/i18n/messages.ts` — EN / UK |

Архітектура: browser викликає `/api/*` на Next.js host, який проксує запити до FastAPI backend. Frontend ніколи не зберігає OpenAI key — усі AI calls проходять через backend RAG і generation pipeline. Client validates API payloads with zod where needed.

---

## 🎨 Brand palette

| Token | Hex | Використання |
|---|---|---|
| <kbd>Blaze Orange</kbd> | `#CC5500` | Primary CTA, "Ready" wordmark, checkmark |
| <kbd>Dark Orange</kbd> | `#FF8C00` | "Set" wordmark, progress bars, active states |
| <kbd>Sandy Orange</kbd> | `#FFAA55` | Hover states, badges, second-level icons |
| <kbd>Peach</kbd> | `#FFD199` | Highlighted block backgrounds, low-priority notifications |
| <kbd>Cream</kbd> | `#FFF0E0` | Card backgrounds, onboarding sections |
| <kbd>Warm White</kbd> | `#FFF7F0` | Page background |
| <kbd>Warm Brown</kbd> | `#7A5030` | Body text, captions |
| <kbd>Deep Brown</kbd> | `#3D2000` | Headings, card borders |
| <kbd>Obsidian</kbd> | `#1A0E00` | Dark-mode navbar, premium UI |

---

## 🚀 Локальний запуск

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

### 2. Frontend

```powershell
cd frontend
npm install
cp .env.example .env.local                 # defaults to local backend
npm run dev                                # http://localhost:3000
```

Відкрийте [http://localhost:3000/demo](http://localhost:3000/demo) і натисніть **Start demo mode**.

---

## 🌍 Продакшен запуск

### Frontend → **Vercel**
1. Import repo into Vercel, root directory `frontend`.
2. Build command: `next build`.
3. Env vars:
```
NEXT_PUBLIC_API_BASE=/api
BACKEND_URL=https://ai-onboarding-service.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://ai-onboarding-service.onrender.com
```
4. Live URL: [ai-onboarding-service-frontend.vercel.app](https://ai-onboarding-service-frontend.vercel.app).

### Backend → **Render**
Python Web Service. Дивіться [backend README](https://github.com/mad-futurist/ai-onboarding-service#run-in-production) для повного списку env vars і migration steps.

---

## 📁 Структура репозиторію

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
