import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4 [&>svg+div]:pl-7 [&>div]:flex [&>div]:flex-col [&>div]:gap-1",
  {
    variants: {
      tone: {
        neutral:
          "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg)]",
        info:
          "border-[color:var(--color-info-soft)] bg-[color:var(--color-info-soft)] text-[color:var(--color-info-fg)]",
        success:
          "border-[color:var(--color-success-soft)] bg-[color:var(--color-success-soft)] text-[color:var(--color-success-fg)]",
        warning:
          "border-[color:var(--color-warning-soft)] bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-fg)]",
        danger:
          "border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger-fg)]",
        ai:
          "border-[color:var(--color-primary-ring)] ai-gradient-soft text-[color:var(--color-primary-active)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, tone, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ tone }), className)} {...props} />
));
Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("text-sm font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm leading-relaxed [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";
