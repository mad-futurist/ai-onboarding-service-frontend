import type {
  AISignal,
  MentorDashboardNewcomerItem,
  MentorDashboardResponse,
  ID,
} from "@/types";

export interface NeedsRow {
  newcomer: MentorDashboardNewcomerItem;
  reason: "blocked" | "signal" | "slow";
  count?: number;
  signalTitle?: string;
  days?: number;
  score: number;
}

const SEVERITY_WEIGHT: Record<string, number> = {
  high: 5,
  medium: 3,
  low: 1,
};

function severityWeight(signal: AISignal | null | undefined): number {
  if (!signal) return 0;
  if (signal.tone === "critical") return 6;
  return SEVERITY_WEIGHT[signal.severity] ?? 0;
}

function daysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const start = new Date(dateStr).getTime();
  if (!Number.isFinite(start)) return 0;
  const ms = Date.now() - start;
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function topNeedsAttention(
  newcomers: MentorDashboardNewcomerItem[],
  limit = 3,
): NeedsRow[] {
  const rows: NeedsRow[] = newcomers.map((n) => {
    const blockedScore = (n.blocked_tasks ?? 0) * 3;
    const signalScore = severityWeight(n.latest_signal);
    const slow = daysSince(n.start_date) > 7 && (n.progress_percent ?? 0) < 25;
    const slowScore = slow ? 2 : 0;
    const score = blockedScore + signalScore + slowScore;

    let reason: NeedsRow["reason"] = "signal";
    if ((n.blocked_tasks ?? 0) > 0) reason = "blocked";
    else if (slow) reason = "slow";
    else if (n.latest_signal) reason = "signal";

    return {
      newcomer: n,
      reason,
      count: n.blocked_tasks ?? 0,
      signalTitle: n.latest_signal?.title,
      days: daysSince(n.start_date),
      score,
    };
  });

  return rows
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export interface HandledRow {
  id: string;
  kind: "drafted" | "summarized" | "resolved";
  firstName: string;
  time: string;
  newcomerId?: ID | null;
}

const HANDLED_TYPES = ["draft_reply", "auto_resolved", "summary"];

export function aiHandledRows(
  recentSignals: AISignal[],
  newcomers: MentorDashboardNewcomerItem[],
  isDemo: boolean,
): HandledRow[] {
  const nameById = new Map(newcomers.map((n) => [n.newcomer_id, n.full_name]));
  const real: HandledRow[] = recentSignals
    .filter(
      (s) =>
        s.status === "resolved" || HANDLED_TYPES.includes(s.signal_type ?? ""),
    )
    .slice(0, 4)
    .map((s) => {
      const firstName = (
        nameById.get(s.newcomer_id ?? -1) ?? ""
      ).split(" ")[0];
      const kind: HandledRow["kind"] = s.signal_type?.includes("draft")
        ? "drafted"
        : s.signal_type?.includes("summary")
          ? "summarized"
          : "resolved";
      return {
        id: String(s.id),
        kind,
        firstName: firstName || "Newcomer",
        time: relativeShortTime(s.created_at),
        newcomerId: s.newcomer_id ?? null,
      };
    });

  if (real.length > 0) return real;

  if (!isDemo || newcomers.length === 0) return [];

  // Demo stub so the right column always looks alive in demos
  const firstNames = newcomers.slice(0, 3).map(
    (n) => (n.full_name || "Newcomer").split(" ")[0],
  );
  const stubs: HandledRow["kind"][] = ["drafted", "summarized", "resolved"];
  const times = ["06:12", "07:48", "08:31"];
  return firstNames.map((firstName, i) => ({
    id: `stub-${i}`,
    kind: stubs[i % stubs.length],
    firstName,
    time: times[i % times.length],
    newcomerId: newcomers[i]?.newcomer_id ?? null,
  }));
}

export interface PulseSummary {
  sigCount: number;
  draftCount: number;
  hours: number;
  isEmpty: boolean;
}

export function summarizePulse(
  data: MentorDashboardResponse | undefined,
  isDemo: boolean,
): PulseSummary {
  const newcomers = data?.newcomers ?? [];
  const recent = data?.recent_signals ?? [];
  const sigCount = recent.length + newcomers.filter((n) => !!n.latest_signal).length;
  const draftCount = recent.filter((s) =>
    HANDLED_TYPES.includes(s.signal_type ?? ""),
  ).length;
  const hours = Math.round((data?.time_saved_hours ?? 0) * 10) / 10;
  const isEmpty = sigCount === 0 && hours === 0 && newcomers.length === 0;

  // Demo seed if everything is zero but we have a cohort
  if (isDemo && sigCount === 0 && newcomers.length > 0) {
    return {
      sigCount: newcomers.length,
      draftCount: Math.max(1, Math.floor(newcomers.length / 2)),
      hours: hours || 4.5,
      isEmpty: false,
    };
  }

  return { sigCount, draftCount, hours, isEmpty };
}

export interface CheckInMove {
  newcomer: MentorDashboardNewcomerItem;
  blockedCount: number;
}

export function pickCheckInMove(
  newcomers: MentorDashboardNewcomerItem[],
): CheckInMove | null {
  const top = [...newcomers]
    .filter((n) => (n.blocked_tasks ?? 0) > 0)
    .sort((a, b) => (b.blocked_tasks ?? 0) - (a.blocked_tasks ?? 0))[0];
  if (!top) return null;
  return { newcomer: top, blockedCount: top.blocked_tasks ?? 0 };
}

export interface AdjustMove {
  newcomer: MentorDashboardNewcomerItem;
  signal: AISignal;
}

export function pickAdjustMove(
  newcomers: MentorDashboardNewcomerItem[],
): AdjustMove | null {
  const withSignal = newcomers.filter((n) => !!n.latest_signal);
  if (withSignal.length === 0) return null;
  const top = withSignal.sort((a, b) => {
    const ta = new Date(a.latest_signal!.created_at).getTime();
    const tb = new Date(b.latest_signal!.created_at).getTime();
    return tb - ta;
  })[0];
  return { newcomer: top, signal: top.latest_signal! };
}

export interface CourseMove {
  topic: string;
  signalType: string;
  occurrenceCount: number;
}

export function pickCourseMove(
  recentSignals: AISignal[],
  newcomers: MentorDashboardNewcomerItem[],
): CourseMove | null {
  const pool = [
    ...recentSignals,
    ...newcomers
      .map((n) => n.latest_signal)
      .filter((s): s is AISignal => !!s),
  ];
  if (pool.length === 0) return null;

  const counts = new Map<string, { count: number; title: string }>();
  for (const s of pool) {
    const key = s.signal_type ?? "signal";
    const entry = counts.get(key);
    const add = s.occurrence_count ?? 1;
    if (entry) {
      entry.count += add;
    } else {
      counts.set(key, { count: add, title: s.title });
    }
  }

  let bestKey: string | null = null;
  let best = { count: 0, title: "" };
  for (const [k, v] of counts) {
    if (v.count > best.count) {
      bestKey = k;
      best = v;
    }
  }

  if (!bestKey || best.count < 2) return null;
  return {
    topic: best.title,
    signalType: bestKey,
    occurrenceCount: best.count,
  };
}

export interface CohortColumn {
  newcomerId: ID;
  firstName: string;
  initials: string;
  percent: number;
  filledCells: number;
  hasSignal: boolean;
  severity: "low" | "medium" | "high" | null;
  signalTitle: string | null;
}

const CELL_COUNT = 14;

export function cohortColumns(
  newcomers: MentorDashboardNewcomerItem[],
): CohortColumn[] {
  return newcomers.map((n) => {
    const percent = Math.max(0, Math.min(100, n.progress_percent ?? 0));
    const filledCells = Math.round((percent / 100) * CELL_COUNT);
    const firstName = (n.full_name || "Newcomer").split(" ")[0];
    const initials = n.full_name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
    const sig = n.latest_signal;
    const sev = sig?.severity;
    return {
      newcomerId: n.newcomer_id,
      firstName,
      initials: initials || "??",
      percent,
      filledCells,
      hasSignal: !!sig,
      severity:
        sev === "low" || sev === "medium" || sev === "high" ? sev : null,
      signalTitle: sig?.title ?? null,
    };
  });
}

export const COHORT_CELL_COUNT = CELL_COUNT;

export interface WeekRollupSnapshot {
  completedTasksTotal: number;
  capturedAt: number;
}

export interface WeekRollupValues {
  tasksShipped: number | null;
  signalsResolved: number;
  draftsApproved: number | null;
  hoursAbsorbed: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function readWeekSnapshot(
  mentorId: ID | null | undefined,
): WeekRollupSnapshot | null {
  if (typeof window === "undefined" || mentorId == null) return null;
  try {
    const raw = window.localStorage.getItem(`onbord.weekSnap.v1.${mentorId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeekRollupSnapshot;
    if (
      typeof parsed.completedTasksTotal !== "number" ||
      typeof parsed.capturedAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeWeekSnapshot(
  mentorId: ID | null | undefined,
  snapshot: WeekRollupSnapshot,
): void {
  if (typeof window === "undefined" || mentorId == null) return;
  try {
    window.localStorage.setItem(
      `onbord.weekSnap.v1.${mentorId}`,
      JSON.stringify(snapshot),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function weekDelta(
  data: MentorDashboardResponse | undefined,
  mentorId: ID | null | undefined,
  isDemo: boolean,
): WeekRollupValues {
  const newcomers = data?.newcomers ?? [];
  const recent = data?.recent_signals ?? [];

  const completedNow = newcomers.reduce(
    (s, n) => s + (n.completed_tasks ?? 0),
    0,
  );

  const snap = readWeekSnapshot(mentorId);
  const fresh = !snap || Date.now() - snap.capturedAt > WEEK_MS;

  let tasksShipped: number | null;
  if (snap && !fresh) {
    tasksShipped = Math.max(0, completedNow - snap.completedTasksTotal);
  } else {
    // Establish the baseline on first ever read
    tasksShipped = null;
    if (mentorId != null) {
      writeWeekSnapshot(mentorId, {
        completedTasksTotal: completedNow,
        capturedAt: Date.now(),
      });
    }
  }

  const signalsResolved = recent.filter((s) => s.status === "resolved").length;
  const hoursAbsorbed = Math.round((data?.time_saved_hours ?? 0) * 10) / 10;

  const realDrafts = recent.filter((s) =>
    HANDLED_TYPES.includes(s.signal_type ?? ""),
  ).length;
  const draftsApproved =
    realDrafts > 0 ? realDrafts : isDemo && newcomers.length > 0 ? 3 : null;

  // Demo seed for tasks/signals so the celebrate line can fire in demos
  if (isDemo && newcomers.length > 0) {
    return {
      tasksShipped:
        tasksShipped === null || tasksShipped === 0
          ? Math.max(1, Math.floor(completedNow * 0.2))
          : tasksShipped,
      signalsResolved: signalsResolved > 0 ? signalsResolved : 2,
      draftsApproved: draftsApproved ?? 3,
      hoursAbsorbed: hoursAbsorbed > 0 ? hoursAbsorbed : 4.5,
    };
  }

  return {
    tasksShipped,
    signalsResolved,
    draftsApproved,
    hoursAbsorbed,
  };
}

export function relativeShortTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const t = new Date(dateStr).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.round(diff / (60 * 60_000))}h ago`;
  return `${Math.round(diff / (24 * 60 * 60_000))}d ago`;
}

export function teamCount(newcomers: MentorDashboardNewcomerItem[]): number {
  return new Set(newcomers.map((n) => n.team).filter(Boolean)).size;
}
