import { cn, clamp } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "ai" | "brand" | "neutral";
  className?: string;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  hint,
  tone = "ai",
  className,
  showValue = true,
}: ProgressBarProps) {
  const pct = clamp((value / max) * 100, 0, 100);
  const fillClass: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
    ai: "ai-gradient",
    brand: "bg-[color:var(--color-primary)]",
    neutral: "bg-[color:var(--color-fg)]",
  };
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-2">
          {label ? (
            <div className="text-xs font-medium text-[color:var(--color-fg-muted)]">{label}</div>
          ) : (
            <span />
          )}
          {showValue ? (
            <div className="text-xs font-semibold text-[color:var(--color-fg)] tabular-nums">
              {Math.round(pct)}%
            </div>
          ) : null}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
        <div className={cn("h-full transition-all duration-500", fillClass[tone])} style={{ width: `${pct}%` }} />
      </div>
      {hint ? <div className="text-xs text-[color:var(--color-fg-subtle)]">{hint}</div> : null}
    </div>
  );
}
