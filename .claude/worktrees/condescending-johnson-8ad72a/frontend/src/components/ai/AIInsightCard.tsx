import * as React from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface AIInsightCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  confidence?: number | null;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  tone?: "soft" | "filled";
}

export function AIInsightCard({
  title,
  description,
  confidence,
  actions,
  children,
  className,
  tone = "soft",
}: AIInsightCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[14px] border shadow-[var(--shadow-card)]",
        tone === "soft"
          ? "ai-gradient-soft border-[color:var(--color-primary-ring)]"
          : "ai-gradient border-transparent text-white",
        className,
      )}
    >
      <div className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5", tone === "filled" ? "" : "")}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg shadow-sm",
              tone === "soft" ? "ai-gradient text-white" : "bg-white/15 text-white backdrop-blur",
            )}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={cn("text-sm font-semibold", tone === "soft" ? "text-[color:var(--color-primary-active)]" : "text-white")}>
                {title}
              </h3>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  tone === "soft"
                    ? "bg-white text-[color:var(--color-primary-active)] border border-[color:var(--color-primary-ring)]"
                    : "bg-white/20 text-white",
                )}
              >
                AI
              </span>
              {typeof confidence === "number" ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    tone === "soft"
                      ? "bg-white text-[color:var(--color-fg-muted)] border border-[color:var(--color-border)]"
                      : "bg-white/15 text-white",
                  )}
                >
                  {Math.round(confidence)}% confidence
                </span>
              ) : null}
            </div>
            {description ? (
              <p className={cn("text-sm", tone === "soft" ? "text-[color:var(--color-fg-muted)]" : "text-white/90")}>
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children ? (
        <div className={cn("px-5 pb-5 pt-4", tone === "soft" ? "text-[color:var(--color-fg)]" : "text-white")}>{children}</div>
      ) : (
        <div className="h-5" />
      )}
    </section>
  );
}
