"use client";

import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

const components: Components = {
  h1: ({ className, ...rest }) => (
    <h1
      className={cn(
        "mt-4 mb-3 text-2xl font-semibold tracking-tight text-[color:var(--color-fg)] first:mt-0",
        className,
      )}
      {...rest}
    />
  ),
  h2: ({ className, ...rest }) => (
    <h2
      className={cn(
        "mt-5 mb-2 text-xl font-semibold tracking-tight text-[color:var(--color-fg)] first:mt-0",
        className,
      )}
      {...rest}
    />
  ),
  h3: ({ className, ...rest }) => (
    <h3
      className={cn(
        "mt-4 mb-2 text-base font-semibold tracking-tight text-[color:var(--color-fg)] first:mt-0",
        className,
      )}
      {...rest}
    />
  ),
  h4: ({ className, ...rest }) => (
    <h4
      className={cn(
        "mt-3 mb-1.5 text-sm font-semibold tracking-tight text-[color:var(--color-fg)] first:mt-0",
        className,
      )}
      {...rest}
    />
  ),
  p: ({ className, ...rest }) => (
    <p
      className={cn("my-2.5 text-sm leading-relaxed text-[color:var(--color-fg)]", className)}
      {...rest}
    />
  ),
  a: ({ className, ...rest }) => (
    <a
      className={cn(
        "text-[color:var(--color-primary)] underline underline-offset-2 hover:text-[color:var(--color-primary-hover)]",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    />
  ),
  ul: ({ className, ...rest }) => (
    <ul
      className={cn(
        "my-2.5 ml-5 list-disc space-y-1 text-sm text-[color:var(--color-fg)] marker:text-[color:var(--color-fg-faint)]",
        className,
      )}
      {...rest}
    />
  ),
  ol: ({ className, ...rest }) => (
    <ol
      className={cn(
        "my-2.5 ml-5 list-decimal space-y-1 text-sm text-[color:var(--color-fg)] marker:text-[color:var(--color-fg-faint)]",
        className,
      )}
      {...rest}
    />
  ),
  li: ({ className, ...rest }) => (
    <li className={cn("leading-relaxed", className)} {...rest} />
  ),
  blockquote: ({ className, ...rest }) => (
    <blockquote
      className={cn(
        "my-3 border-l-2 border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] px-3 py-2 text-sm text-[color:var(--color-fg-muted)]",
        className,
      )}
      {...rest}
    />
  ),
  code: ({ className, children, ...rest }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className={cn(
            "block whitespace-pre overflow-x-auto rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3 text-[12.5px] leading-relaxed text-[color:var(--color-fg)] font-mono",
            className,
          )}
          {...rest}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className={cn(
          "rounded bg-[color:var(--color-surface-muted)] px-1 py-0.5 text-[12.5px] font-mono text-[color:var(--color-fg)]",
          className,
        )}
        {...rest}
      >
        {children}
      </code>
    );
  },
  pre: ({ className, ...rest }) => (
    <pre className={cn("my-3 [&>code]:p-3", className)} {...rest} />
  ),
  hr: ({ className, ...rest }) => (
    <hr className={cn("my-4 border-[color:var(--color-border)]", className)} {...rest} />
  ),
  table: ({ className, ...rest }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-[color:var(--color-border)]">
      <table
        className={cn("min-w-full text-sm text-[color:var(--color-fg)]", className)}
        {...rest}
      />
    </div>
  ),
  th: ({ className, ...rest }) => (
    <th
      className={cn(
        "border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-left font-medium",
        className,
      )}
      {...rest}
    />
  ),
  td: ({ className, ...rest }) => (
    <td
      className={cn("border-b border-[color:var(--color-border)] px-3 py-2", className)}
      {...rest}
    />
  ),
  strong: ({ className, ...rest }) => (
    <strong className={cn("font-semibold text-[color:var(--color-fg)]", className)} {...rest} />
  ),
  em: ({ className, ...rest }) => (
    <em className={cn("italic", className)} {...rest} />
  ),
};

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("text-sm text-[color:var(--color-fg)]", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
