import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral:
          "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-muted)] border-[color:var(--color-border)]",
        success:
          "bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)] border-[color:var(--color-success-soft)]",
        warning:
          "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)] border-[color:var(--color-warning-soft)]",
        danger:
          "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)] border-[color:var(--color-danger-soft)]",
        info:
          "bg-[color:var(--color-info-soft)] text-[color:var(--color-info-fg)] border-[color:var(--color-info-soft)]",
        ai:
          "ai-gradient-soft text-[color:var(--color-primary-active)] border-[color:var(--color-primary-ring)]",
        brand:
          "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)] border-[color:var(--color-primary-softer)]",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px]",
        md: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ tone, size }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";
