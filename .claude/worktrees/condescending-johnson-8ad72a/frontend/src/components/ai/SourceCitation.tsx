import { BookOpen, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AIQuestionSource } from "@/types";

interface SourceCitationProps {
  source: AIQuestionSource;
  index?: number;
  onClick?: () => void;
  className?: string;
}

export function SourceCitation({ source, index, onClick, className }: SourceCitationProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3 text-left transition-colors hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]",
        className,
      )}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)] text-xs font-semibold">
        {typeof index === "number" ? index + 1 : <FileText className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[color:var(--color-fg)] truncate">
          {source.title ?? source.source ?? "Source"}
        </div>
        {source.excerpt ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--color-fg-muted)]">{source.excerpt}</p>
        ) : null}
        <div className="mt-1 flex items-center gap-2 text-[11px] text-[color:var(--color-fg-subtle)]">
          <BookOpen className="h-3 w-3" />
          {source.source ?? "Knowledge base"}
          {typeof source.score === "number" ? (
            <span className="rounded-full border border-[color:var(--color-border)] px-1.5 py-0 text-[10px]">
              relevance {Math.round((source.score ?? 0) * 100)}%
            </span>
          ) : null}
        </div>
      </div>
    </Comp>
  );
}
