import { cn } from "@/lib/utils";

type SkillStatus = "strong" | "good" | "improving" | "medium" | "not_started" | "weak" | string;

interface SkillRow {
  area: string;
  status: SkillStatus;
  evidence?: string;
}

const STATUS_VALUE: Record<string, number> = {
  strong: 1.0,
  good: 0.85,
  improving: 0.55,
  medium: 0.5,
  not_started: 0.1,
  weak: 0.25,
};

const STATUS_COLOR: Record<string, string> = {
  strong: "bg-[color:var(--color-success)]",
  good: "bg-[color:var(--color-success)]",
  improving: "bg-[color:var(--color-warning)]",
  medium: "bg-[color:var(--color-warning)]",
  not_started: "bg-[color:var(--color-border-strong)]",
  weak: "bg-[color:var(--color-danger)]",
};

const STATUS_LABEL: Record<string, string> = {
  strong: "Strong",
  good: "Good",
  improving: "Improving",
  medium: "Medium",
  not_started: "Not started",
  weak: "Gap",
};

export function SkillMap({ rows, className }: { rows: SkillRow[]; className?: string }) {
  if (!rows.length) return null;
  return (
    <div className={cn("space-y-2", className)}>
      {rows.map((row) => {
        const value = STATUS_VALUE[row.status] ?? 0.4;
        const color = STATUS_COLOR[row.status] ?? "bg-stone-400";
        const label = STATUS_LABEL[row.status] ?? row.status;
        return (
          <div key={row.area} className="grid grid-cols-[160px_1fr_80px] items-center gap-3">
            <div className="truncate text-sm text-[color:var(--color-fg)]">{row.area}</div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
              <div className={cn("h-full", color)} style={{ width: `${Math.round(value * 100)}%` }} />
            </div>
            <div className="text-right text-xs font-medium text-[color:var(--color-fg-muted)]">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
