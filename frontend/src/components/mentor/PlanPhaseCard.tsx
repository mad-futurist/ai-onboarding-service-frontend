import Link from "next/link";
import { Check, CircleDashed, AlertTriangle, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/shared/StatusBadge";
import type { ID, OnboardingTask } from "@/types";

interface PlanPhaseCardProps {
  title: string;
  subtitle?: string;
  tasks: OnboardingTask[];
  className?: string;
  /** When provided, each task title becomes a link to this href. */
  linkTo?: (taskId: ID) => string;
}

export function PlanPhaseCard({ title, subtitle, tasks, className, linkTo }: PlanPhaseCardProps) {
  const grouped = groupByWeek(tasks);
  return (
    <section
      className={cn(
        "rounded-[14px] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">{title}</h3>
          {subtitle ? (
            <p className="text-xs text-[color:var(--color-fg-muted)]">{subtitle}</p>
          ) : null}
        </div>
        <span className="text-xs font-medium text-[color:var(--color-fg-subtle)]">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </header>
      <div className="space-y-4">
        {Object.entries(grouped).map(([week, ts]) => (
          <div key={week}>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              {week === "0" ? "Unscheduled" : `Week ${week}`}
            </div>
            <ul className="space-y-1.5">
              {ts.map((t) => (
                <TaskRow key={t.id} task={t} linkTo={linkTo} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function TaskRow({ task, linkTo }: { task: OnboardingTask; linkTo?: (taskId: ID) => string }) {
  const Icon =
    task.status === "done"
      ? Check
      : task.status === "blocked"
        ? AlertTriangle
        : CircleDashed;
  const iconColor =
    task.status === "done"
      ? "text-[color:var(--color-success)]"
      : task.status === "blocked"
        ? "text-[color:var(--color-danger)]"
        : "text-[color:var(--color-fg-faint)]";

  const inner = (
    <>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="min-w-0">
          <div
            className={cn(
              "text-sm text-[color:var(--color-fg)] truncate",
              task.status === "done" && "line-through text-[color:var(--color-fg-muted)]",
              linkTo && "group-hover:underline",
            )}
          >
            {task.title}
          </div>
          {task.description ? (
            <div className="text-xs text-[color:var(--color-fg-muted)] line-clamp-1">{task.description}</div>
          ) : null}
        </div>
        {task.priority ? <PriorityBadge priority={task.priority} size="sm" /> : null}
        {linkTo ? (
          <ChevronRight className="h-3.5 w-3.5 text-[color:var(--color-fg-faint)] group-hover:text-[color:var(--color-fg-muted)]" />
        ) : null}
      </div>
    </>
  );

  const rowClass =
    "flex items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)]/50";

  if (linkTo) {
    return (
      <li>
        <Link href={linkTo(task.id)} className={cn("group", rowClass)}>
          {inner}
        </Link>
      </li>
    );
  }
  return <li className={rowClass}>{inner}</li>;
}

function groupByWeek(tasks: OnboardingTask[]): Record<string, OnboardingTask[]> {
  const out: Record<string, OnboardingTask[]> = {};
  for (const t of tasks) {
    const wk = t.week_number ?? 0;
    const key = String(wk);
    out[key] ??= [];
    out[key].push(t);
  }
  return out;
}
