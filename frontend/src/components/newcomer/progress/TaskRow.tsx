"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  ArrowRight,
  Flame,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OnboardingTask } from "@/types";

interface TaskRowProps {
  task: OnboardingTask;
  href?: string;
}

export function TaskRow({ task, href }: TaskRowProps) {
  const tone = statusTone(task.status);
  const dayLabel = formatDay(task);

  const content = (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition-colors",
        tone.border,
        "hover:border-[color:var(--color-primary-ring)]",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-2 bottom-2 w-[3px] rounded-r",
          tone.rail,
        )}
        aria-hidden
      />
      <div
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
          tone.iconBg,
        )}
      >
        <StatusIcon status={task.status} className={cn("h-3.5 w-3.5", tone.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {dayLabel ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              {dayLabel}
            </span>
          ) : null}
          {task.priority === "high" ? (
            <Badge tone="danger" size="sm">
              <Flame className="h-2.5 w-2.5" /> High
            </Badge>
          ) : null}
        </div>
        <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">
          {task.title}
        </div>
      </div>
      {href ? (
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-faint)] transition-colors group-hover:text-[color:var(--color-primary)]" />
      ) : null}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`Open task: ${task.title}`}>
        {content}
      </Link>
    );
  }
  return content;
}

function formatDay(task: OnboardingTask): string | null {
  if (task.day_number != null) return `Day ${task.day_number}`;
  if (task.week_number != null) return `Week ${task.week_number}`;
  return null;
}

function StatusIcon({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  switch (status) {
    case "done":
      return <CheckCircle2 className={className} />;
    case "blocked":
      return <AlertTriangle className={className} />;
    default:
      return <CircleDashed className={className} />;
  }
}

interface ToneClasses {
  border: string;
  rail: string;
  iconBg: string;
  iconColor: string;
}

function statusTone(status: string): ToneClasses {
  switch (status) {
    case "done":
      return {
        border: "border-[color:var(--color-success-soft)]",
        rail: "bg-[color:var(--color-success)]",
        iconBg: "bg-[color:var(--color-success-soft)]",
        iconColor: "text-[color:var(--color-success-fg)]",
      };
    case "blocked":
      return {
        border: "border-[color:var(--color-danger-soft)]",
        rail: "bg-[color:var(--color-danger)]",
        iconBg: "bg-[color:var(--color-danger-soft)]",
        iconColor: "text-[color:var(--color-danger-fg)]",
      };
    case "in_progress":
      return {
        border: "border-[color:var(--color-primary-ring)]",
        rail: "ai-gradient",
        iconBg: "bg-[color:var(--color-primary-soft)]",
        iconColor: "text-[color:var(--color-primary-active)]",
      };
    default:
      return {
        border: "border-[color:var(--color-border)]",
        rail: "bg-[color:var(--color-border-strong)]",
        iconBg: "bg-[color:var(--color-surface-muted)]",
        iconColor: "text-[color:var(--color-fg-muted)]",
      };
  }
}
