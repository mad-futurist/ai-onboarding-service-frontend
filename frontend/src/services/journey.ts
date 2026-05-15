import { parseISO, differenceInCalendarDays } from "date-fns";

import type {
  ID,
  JourneyPeriod,
  Newcomer,
  NewcomerJourney,
  OnboardingPlanWithTasks,
  PeriodStatus,
} from "@/types";
import { listPlans } from "@/services/plans";
import { getNewcomer } from "@/services/newcomers";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_HORIZON = 120;

/**
 * Builds a newcomer's journey by composing existing /onboarding-plans data.
 *
 * Today the backend doesn't expose a /journeys endpoint, so this function
 * derives the journey client-side: each plan = one period, positioned on
 * the timeline using period_start/period_end (or the plan's tasks' weeks
 * if dates aren't set). This same shape will plug straight into a future
 * real endpoint with zero UI churn.
 */
export async function getNewcomerJourney(newcomerId: ID): Promise<NewcomerJourney> {
  const [plans, newcomer] = await Promise.all([
    listPlans({ newcomer_id: newcomerId }).catch(() => [] as OnboardingPlanWithTasks[]),
    getNewcomer(newcomerId).catch(() => null as Newcomer | null),
  ]);

  const periods = derivePeriods(plans, newcomer);
  const horizonDays = computeHorizon(periods);

  return {
    newcomer_id: newcomerId,
    newcomer_name: newcomer?.full_name ?? `Newcomer #${newcomerId}`,
    start_date: newcomer?.start_date ?? null,
    horizon_days: horizonDays,
    periods,
  };
}

function derivePeriods(
  plans: OnboardingPlanWithTasks[],
  newcomer: Newcomer | null,
): JourneyPeriod[] {
  const unique = dedupePlans(plans);
  const startDate = newcomer?.start_date ? parseISO(newcomer.start_date) : null;

  const periods = unique
    .map((plan, idx) => {
      const planStart = plan.period_start ? parseISO(plan.period_start) : null;
      const planEnd = plan.period_end ? parseISO(plan.period_end) : null;

      let startDay = 0;
      let endDay = 30;
      if (planStart && startDate) {
        startDay = Math.max(0, differenceInCalendarDays(planStart, startDate));
      } else {
        startDay = idx * 30;
      }
      if (planEnd && startDate) {
        endDay = Math.max(startDay + 1, differenceInCalendarDays(planEnd, startDate));
      } else if (planStart && planEnd) {
        endDay = startDay + Math.max(1, Math.floor((planEnd.getTime() - planStart.getTime()) / DAY_MS));
      } else {
        endDay = startDay + 30;
      }

      const tasks = plan.tasks ?? [];
      const tasksDone = tasks.filter((t) => t.status === "done").length;
      const weeks = new Set<number>();
      for (const t of tasks) {
        if (t.week_id) weeks.add(Number(t.week_id));
        else if (t.week_number != null) weeks.add(t.week_number);
      }

      const status: PeriodStatus = inferStatus(plan);

      const period: JourneyPeriod = {
        id: plan.id,
        plan_id: plan.id,
        index: idx + 1,
        label: plan.period_label ?? plan.title ?? `Period ${idx + 1}`,
        start_day: startDay,
        end_day: endDay,
        start_date: plan.period_start ?? null,
        end_date: plan.period_end ?? null,
        goal: plan.goal ?? null,
        status,
        tasks_total: tasks.length,
        tasks_done: tasksDone,
        weeks_count: weeks.size,
        ai_confidence: plan.ai_confidence ?? null,
        missing_context: plan.missing_context ?? null,
        current_version: 1,
        version_count: 1,
        updated_at: plan.updated_at ?? plan.created_at,
      };
      return period;
    })
    .sort((a, b) => a.start_day - b.start_day)
    .map((p, idx) => ({ ...p, index: idx + 1 }));

  return periods;
}

function inferStatus(plan: OnboardingPlanWithTasks): PeriodStatus {
  if (plan.mentor_approved || plan.status === "approved") return "approved";
  if (plan.status === "archived") return "archived";
  return "draft";
}

function computeHorizon(periods: JourneyPeriod[]): number {
  const lastEnd = periods.reduce((acc, p) => Math.max(acc, p.end_day), 0);
  return Math.max(DEFAULT_HORIZON, Math.ceil(lastEnd / 30) * 30);
}

function dedupePlans(plans: OnboardingPlanWithTasks[]): OnboardingPlanWithTasks[] {
  const seen = new Map<ID, OnboardingPlanWithTasks>();
  for (const plan of plans) {
    if (!seen.has(plan.id)) seen.set(plan.id, plan);
  }
  return Array.from(seen.values());
}

/* ---------------------------------------------------------------------- */
/* Versions — local snapshots (sessionStorage) until the backend has them */
/* ---------------------------------------------------------------------- */

import type { PeriodVersion } from "@/types";

const STORAGE_KEY = "ai-onboarding/period-versions";

interface VersionStore {
  [periodId: string]: PeriodVersion[];
}

function readStore(): VersionStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VersionStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: VersionStore): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota exceeded — drop silently */
  }
}

export function listPeriodVersions(periodId: ID): PeriodVersion[] {
  const store = readStore();
  return store[String(periodId)] ?? [];
}

export function snapshotPeriodVersion(
  periodId: ID,
  plan: OnboardingPlanWithTasks,
  generationNotes?: string,
): PeriodVersion {
  const store = readStore();
  const existing = store[String(periodId)] ?? [];
  const versionNumber = existing.length + 1;

  const weeksMap = new Map<number, {
    id: ID | string;
    index: number;
    title: string;
    goals?: string[] | null;
    tasks: PeriodVersion["snapshot"]["weeks"][number]["tasks"];
  }>();

  for (const task of plan.tasks ?? []) {
    const weekIdx = task.week_number ?? 0;
    const bucket = weeksMap.get(weekIdx) ?? {
      id: task.week_id ?? `w${weekIdx}`,
      index: weekIdx,
      title: `Week ${weekIdx}`,
      goals: null,
      tasks: [],
    };
    bucket.tasks.push({
      id: task.id,
      title: task.title,
      description: task.description,
      success_criteria: task.success_criteria,
      priority: task.priority,
      status: task.status,
    });
    weeksMap.set(weekIdx, bucket);
  }

  const snapshot: PeriodVersion["snapshot"] = {
    weeks: Array.from(weeksMap.values()).sort((a, b) => a.index - b.index),
  };

  const version: PeriodVersion = {
    id: Date.now(),
    period_id: periodId,
    version_number: versionNumber,
    created_at: new Date().toISOString(),
    generation_notes: generationNotes,
    snapshot,
  };

  store[String(periodId)] = [...existing, version];
  writeStore(store);
  return version;
}

export function clearPeriodVersions(periodId: ID): void {
  const store = readStore();
  delete store[String(periodId)];
  writeStore(store);
}
