# Onbord — AI onboarding service (frontend)

A B2B SaaS frontend for an **AI onboarding service**. Two role experiences:

- **Mentor cockpit** — generate AI-powered 30/60/90 plans, manage knowledge base, react to AI-detected friction signals, approve adaptive plan changes.
- **Newcomer workspace** — see only today's focus, follow a phase-based plan, ask AI grounded questions with sources, report blockers.

Tied together by a built-in **role switcher** for demoing the full flow without authentication.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 + `tw-animate-css`
- shadcn-style primitives over Radix UI
- React Query · React Hook Form + Zod · Sonner · Framer Motion · Lucide

## Run

The frontend talks to a FastAPI backend; the dev server proxies `/api/*` to it via `next.config.ts` rewrites (so CORS isn't an issue).

```bash
# Backend (in the backend repo) — must be running on port 8000
uvicorn app.main:app --reload --port 8000

# Frontend
npm install
npm run dev
```

Then open <http://localhost:3000>. On first load the app calls `POST /demo/seed` once to populate Tanya + Marko + a 10-task plan + the knowledge base.

## Env vars (optional, `.env.local`)

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000   # backend origin, proxied via /api
NEXT_PUBLIC_API_BASE=/api                       # frontend axios base
```

## Structure

```
src/
  app/
    (app)/          # route group sharing the AppShell
      mentor/...    # Mentor cockpit screens
      newcomer/...  # Newcomer workspace screens
      demo/         # Scripted demo scenario page
    layout.tsx      # Root layout — providers + Toaster
    page.tsx        # Landing → redirects to /mentor or /newcomer
  components/
    app-shell/      # Sidebar, TopBar, RoleSwitcher, AppShell
    ai/             # AI-specific surfaces: AIInsightCard, SignalRow, SourceCitation
    mentor/         # NewcomerCard, PlanPhaseCard
    newcomer/       # BlockedDialog
    charts/         # ProgressBar, SkillMap
    shared/         # PageHeader, StatusBadge, MetricCard, EmptyState, skeletons
    ui/             # Primitives (button, card, dialog, dropdown, etc.)
  lib/              # api, query-client, utils, constants, format
  services/         # One module per backend resource
  hooks/            # Thin React Query wrappers
  providers/        # QueryProvider, DemoProvider (seeds + role state)
  types/            # TS mirrors of backend Pydantic schemas
```

## Demo flow

Visit `/demo` for the scripted 5-scene narrative:

1. Mentor adds Tanya + selects sources → AI generates the plan → Mentor approves.
2. Newcomer opens home → sees today's focus.
3. Newcomer asks AI → grounded answer with sources.
4. AI detects deployment confusion → signal lands in mentor's profile with evidence.
5. AI proposes a plan adjustment → mentor approves.
