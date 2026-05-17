"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbCrumb {
  label: React.ReactNode;
  href?: string;
}

interface PlanBreadcrumbProps {
  crumbs: BreadcrumbCrumb[];
  actions?: React.ReactNode;
}

export function PlanBreadcrumb({ crumbs, actions }: PlanBreadcrumbProps) {
  const backHref = crumbs.length >= 2 ? crumbs[crumbs.length - 2].href : crumbs[0]?.href;
  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 mb-5 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/85 px-4 sm:px-6 py-2.5 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          {backHref ? (
            <Link
              href={backHref}
              data-demo-id="plan-breadcrumb-back"
              className="grid h-7 w-7 place-items-center rounded-md text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]"
              aria-label="Back"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          ) : null}
          <ol className="flex items-center gap-1">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              const classes = cn(
                "rounded px-1.5 py-0.5 text-xs",
                isLast
                  ? "font-medium text-[color:var(--color-fg)]"
                  : "text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]",
              );
              return (
                <React.Fragment key={i}>
                  <li>
                    {crumb.href && !isLast ? (
                      <Link href={crumb.href} className={classes}>
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={classes}>{crumb.label}</span>
                    )}
                  </li>
                  {!isLast ? (
                    <ChevronRight className="h-3 w-3 text-[color:var(--color-fg-faint)]" />
                  ) : null}
                </React.Fragment>
              );
            })}
          </ol>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
