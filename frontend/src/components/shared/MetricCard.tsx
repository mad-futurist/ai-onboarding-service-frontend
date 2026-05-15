import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "ai" | "success" | "warning" | "danger";
  className?: string;
  pulse?: boolean;
  trail?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
  pulse,
  trail,
}: MetricCardProps) {
  const iconBg: Record<NonNullable<MetricCardProps["tone"]>, string> = {
    default: "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)]",
    ai: "ai-gradient text-white",
    success: "bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]",
    warning: "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)]",
    danger: "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)]",
  };
  return (
    <Card className={cn("relative overflow-hidden p-5 transition-all", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-fg)]">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">{hint}</div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {trail}
          {Icon ? (
            <div className="relative">
              {pulse ? (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-lg animate-[signal-pulse_2.4s_ease-in-out_infinite]"
                />
              ) : null}
              <div
                className={cn(
                  "relative grid h-9 w-9 place-items-center rounded-lg",
                  iconBg[tone],
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
