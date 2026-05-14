import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="space-y-1">
        {eyebrow ? (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary)]">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-[26px] font-semibold tracking-tight leading-tight text-[color:var(--color-fg)]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-[color:var(--color-fg-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
