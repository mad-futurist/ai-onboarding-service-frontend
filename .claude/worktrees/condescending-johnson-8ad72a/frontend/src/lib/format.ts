import { format, formatDistanceToNow, parseISO } from "date-fns";

export function fmtDate(value: string | Date | null | undefined, pattern = "MMM d, yyyy"): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, pattern);
}

export function fmtRelative(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function dayOf(startDate: string | null | undefined, day: number = 90): { current: number; total: number } {
  const total = day;
  if (!startDate) return { current: 1, total };
  const start = parseISO(startDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return { current: Math.max(1, Math.min(total, diff + 1)), total };
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural ?? singular + "s"}`;
}
