"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] shadow-sm hover:bg-[color:var(--color-primary-hover)] active:bg-[color:var(--color-primary-active)]",
        ai: "ai-gradient text-white shadow-sm hover:brightness-105 active:brightness-95",
        outline:
          "border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-muted)]",
        ghost:
          "text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-muted)]",
        soft:
          "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)] hover:bg-[color:var(--color-primary-softer)]",
        secondary:
          "bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-border)]",
        destructive:
          "bg-[color:var(--color-danger)] text-white shadow-sm hover:brightness-95",
        link:
          "text-[color:var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
