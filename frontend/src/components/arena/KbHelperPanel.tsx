"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeDollarSign,
  BookOpen,
  Building2,
  ChevronDown,
  ExternalLink,
  FileText,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { listSessionKbSnippets } from "@/services/arena";
import type { ArenaKbSnippet, ID } from "@/types";

interface KbHelperPanelProps {
  sessionId: ID;
}

const ICON_BY_TYPE: Record<string, React.ElementType | string> = {
  price_list: BadgeDollarSign,
  company_profile: Building2,
  policy: "📜",
  runbook: "📖",
  handbook: "🧭",
  reference: "📚",
  guide: "🧑‍🏫",
  checklist: "✅",
};

export function KbHelperPanel({ sessionId }: KbHelperPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["arena", "kb-snippets", sessionId],
    queryFn: () => listSessionKbSnippets(sessionId),
    enabled: Number.isFinite(sessionId),
  });

  const [expanded, setExpanded] = React.useState<Record<ID, boolean>>({});
  const [panelOpen, setPanelOpen] = React.useState(true);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
      data-demo-id="arena-live-documents"
    >
      <button
        type="button"
        onClick={() => setPanelOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-ring)]"
        aria-expanded={panelOpen}
      >
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          Helper docs
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform",
            !panelOpen && "-rotate-90",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {panelOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="-mr-1 max-h-[320px] space-y-1 overflow-y-auto pr-1">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-4/6" />
          </>
        ) : !data || data.length === 0 ? (
          <p className="py-2 text-xs text-[color:var(--color-fg-muted)]">
            No documents linked to this scenario. Mentor can attach KB sources when publishing.
          </p>
        ) : (
          data.map((doc: ArenaKbSnippet) => {
            const open = !!expanded[doc.id];
            const icon =
              (doc.document_type && ICON_BY_TYPE[doc.document_type]) ?? "📄";
            return (
              <div
                key={doc.id}
                className="overflow-hidden rounded-md border border-[color:var(--color-border)]"
              >
                <button
                  onClick={() =>
                    setExpanded((s) => ({ ...s, [doc.id]: !s[doc.id] }))
                  }
                  className="flex w-full items-start gap-2 px-2 py-1.5 text-left text-xs hover:bg-[color:var(--color-surface-muted)]"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[color:var(--color-surface-muted)] text-[color:var(--color-primary-active)]">
                    {typeof icon === "string" ? (
                      <span className="text-[11px] leading-none">{icon}</span>
                    ) : (
                      React.createElement(icon, { className: "h-3.5 w-3.5" })
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-[color:var(--color-fg)]">
                      {doc.title}
                    </span>
                    {doc.domain ? (
                      <span className="block text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                        {doc.domain}
                      </span>
                    ) : null}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-subtle)] transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40"
                    >
                      <div className="px-2 py-2 text-[11.5px] leading-snug text-[color:var(--color-fg)]">
                        {doc.snippet || "(no preview)"}
                        <a
                          href={doc.source ?? "#"}
                          onClick={(e) => {
                            if (!doc.source) e.preventDefault();
                          }}
                          target={doc.source ? "_blank" : undefined}
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--color-primary)] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {doc.source ? "Open source" : "No link"}
                        </a>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })
        )}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-[color:var(--color-fg-subtle)]">
                <FileText className="h-2.5 w-2.5" />
                Quick-consult: price list and company docs stay open during the call.
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
