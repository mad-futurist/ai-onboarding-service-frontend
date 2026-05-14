import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, SeverityBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { getInitials, cn } from "@/lib/utils";
import type { MentorDashboardNewcomerItem } from "@/types";

export function NewcomerCard({ newcomer }: { newcomer: MentorDashboardNewcomerItem }) {
  const pct = newcomer.progress_percent ?? 0;
  const status = newcomer.computed_status ?? newcomer.onboarding_status;
  const accent =
    status === "needs_attention" || status === "blocked"
      ? "border-[color:var(--color-warning-soft)] bg-[color:var(--color-warning-soft)]/30"
      : "";

  return (
    <Link
      href={`/mentor/newcomers/${newcomer.newcomer_id}`}
      className={cn(
        "group block rounded-[14px] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-px hover:shadow-[var(--shadow-elevated)] hover:border-[color:var(--color-primary-ring)]",
        accent,
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(newcomer.full_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)] truncate">
              {newcomer.full_name}
            </h3>
            <ArrowUpRight className="h-4 w-4 text-[color:var(--color-fg-faint)] group-hover:text-[color:var(--color-primary)] transition-colors" />
          </div>
          <div className="text-xs text-[color:var(--color-fg-muted)] truncate">
            {newcomer.job_title} · {newcomer.team}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={pct}
          label={
            <span>
              {newcomer.completed_tasks}/{newcomer.total_tasks} tasks done
            </span>
          }
          tone={status === "needs_attention" || status === "blocked" ? "brand" : "ai"}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={status} size="sm" />
        {newcomer.blocked_tasks > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-danger-fg)]">
            {newcomer.blocked_tasks} blocked
          </span>
        ) : null}
      </div>

      {newcomer.latest_signal ? (
        <div className="mt-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/50 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
            <Sparkles className="h-3 w-3" /> Latest AI signal
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-[color:var(--color-fg)] line-clamp-1 flex-1">{newcomer.latest_signal.title}</p>
            <SeverityBadge severity={newcomer.latest_signal.severity} size="sm" />
          </div>
        </div>
      ) : null}
    </Link>
  );
}
