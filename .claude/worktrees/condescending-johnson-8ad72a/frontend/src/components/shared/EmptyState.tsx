import * as React from "react";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon = Sparkles, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-white p-10 text-center",
        className,
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl ai-gradient-soft border border-[color:var(--color-primary-ring)]">
        <Icon className="h-5 w-5 text-[color:var(--color-primary-active)]" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-[color:var(--color-fg-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
