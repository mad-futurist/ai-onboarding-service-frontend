import type { ID } from "@/types";

const COMPLETED_KEY = (courseId: ID) => `newcomer.course.${courseId}.completed`;
const COMPLETED_KEY_RE = /^newcomer\.course\.(\d+)\.completed$/;
const LAST_VIEWED_KEY = "newcomer.course.last-viewed";

export interface CourseProgressEntry {
  courseId: ID;
  completedLessonIds: ID[];
}

/**
 * Read the set of completed lesson IDs for a given course from localStorage.
 * Returns an empty array if no progress has been stored yet, or if storage
 * is unavailable.
 */
export function readCompletedLessons(courseId: ID): ID[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMPLETED_KEY(courseId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ID[]) : [];
  } catch {
    return [];
  }
}

/**
 * Snapshot every course we have local progress for. Used to surface
 * "Continue learning" / "Recently completed" widgets without round-tripping
 * to the backend.
 */
export function readAllCourseProgress(): CourseProgressEntry[] {
  if (typeof window === "undefined") return [];
  const out: CourseProgressEntry[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      const match = key.match(COMPLETED_KEY_RE);
      if (!match) continue;
      const courseId = Number(match[1]);
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          out.push({ courseId, completedLessonIds: parsed as ID[] });
        }
      } catch {
        // skip corrupt entry
      }
    }
  } catch {
    return [];
  }
  return out;
}

/** Most recently opened course (id only). Updated by the course detail page. */
export function readLastViewedCourseId(): ID | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_VIEWED_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeLastViewedCourseId(courseId: ID): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_VIEWED_KEY, String(courseId));
  } catch {
    // ignore
  }
}

export function computeProgress(
  completedCount: number,
  total: number | null | undefined,
): { pct: number; done: number; total: number; complete: boolean } {
  const safeTotal = Math.max(total ?? 0, 0);
  const done = Math.min(completedCount, safeTotal || completedCount);
  const pct =
    safeTotal > 0 ? Math.round((done / safeTotal) * 100) : completedCount > 0 ? 100 : 0;
  return {
    pct,
    done,
    total: safeTotal,
    complete: safeTotal > 0 && done >= safeTotal,
  };
}
