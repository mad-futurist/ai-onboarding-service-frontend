"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, FileText, Search, Sparkles, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemo } from "@/providers/demo-provider";
import { listNewcomerDocuments } from "@/services/newcomer-kb";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";

const DOMAIN_OPTIONS = [
  { value: "", label: "All domains" },
  { value: "engineering", label: "Engineering" },
  { value: "hr", label: "HR" },
  { value: "product", label: "Product" },
  { value: "security", label: "Security" },
  { value: "finance", label: "Finance" },
  { value: "general", label: "General" },
];

export default function NewcomerKnowledgePage() {
  const { newcomerId } = useDemo();
  const reduced = useReducedMotion();
  const [search, setSearch] = React.useState("");
  const [domain, setDomain] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["newcomer-kb", "documents", newcomerId],
    queryFn: () => listNewcomerDocuments(newcomerId!),
    enabled: !!newcomerId,
  });

  const filtered = React.useMemo(() => {
    const docs = data ?? [];
    return docs.filter((d) => {
      if (domain && (d.domain ?? "").toLowerCase() !== domain) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !d.title.toLowerCase().includes(q) &&
          !(d.content ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, search, domain]);

  const recommended = React.useMemo(
    () => filtered.filter((doc) => doc.is_recommended),
    [filtered],
  );
  const otherDocs = React.useMemo(
    () => filtered.filter((doc) => !doc.is_recommended),
    [filtered],
  );

  const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-48 bg-grid-faint opacity-60" aria-hidden />

      <PageHeader
        eyebrow="Knowledge"
        title={
          <span>
            Your team&apos;s brain,{" "}
            <span className="ai-gradient-text">at your fingertips</span>
          </span>
        }
        description="Browse documents you have access to, preview them in style, ask focused questions, and explore them as a mind map."
      />

      {/* Hero stat banner */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easing }}
        className="relative overflow-hidden rounded-2xl ai-gradient p-5 text-white shadow-[var(--shadow-ai)]"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-6 -bottom-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider opacity-80">Available to you</div>
              <div className="text-2xl font-semibold leading-tight">
                {data?.length ?? 0} documents
              </div>
              <div className="text-xs text-white/80">
                {recommended.length} recommended for your role
              </div>
            </div>
          </div>
          <p className="max-w-md text-sm text-white/90">
            AI highlights the most useful sources for your role first. You can still browse every document in the company knowledge base.
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-fg-faint)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or content…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DOMAIN_OPTIONS.map((opt) => {
            const active = domain === opt.value;
            return (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => setDomain(opt.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "ai-gradient border-transparent text-white shadow-sm"
                    : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-primary-ring)] hover:text-[color:var(--color-fg)]",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl ai-gradient-soft">
              <BookOpen className="h-5 w-5 text-[color:var(--color-primary)]" />
            </div>
            <div className="text-sm font-medium">No documents match your filters</div>
            <p className="text-xs text-[color:var(--color-fg-muted)]">
              Try clearing the search or selecting a different domain.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {recommended.length ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" />
                <h2 className="text-sm font-semibold text-[color:var(--color-fg)]">
                  Recommended for your role
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((doc, idx) => (
                  <DocumentCard key={doc.id} doc={doc} index={idx} reduced={!!reduced} />
                ))}
              </div>
            </section>
          ) : null}

          {otherDocs.length ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[color:var(--color-fg)]">
                All other documents
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherDocs.map((doc, idx) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    index={idx + recommended.length}
                    reduced={!!reduced}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DocumentCard({
  doc,
  index,
  reduced,
}: {
  doc: DocumentItem;
  index: number;
  reduced: boolean;
}) {
  const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const preview = (doc.content ?? "")
    .replace(/[#*_`>]/g, "")
    .slice(0, 140)
    .trim();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easing, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link href={`/newcomer/knowledge/${doc.id}`} className="group block">
        <div className="ai-border rounded-2xl transition-transform duration-200 group-hover:-translate-y-0.5">
          <Card className="border-0 shadow-[var(--shadow-card)] group-hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl ai-gradient-soft text-[color:var(--color-primary)]">
                  <FileText className="h-4 w-4" />
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-fg-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--color-primary)]" />
              </div>
              <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-[color:var(--color-fg)]">
                {doc.title}
              </h3>
              {preview ? (
                <p className="text-xs leading-relaxed text-[color:var(--color-fg-muted)] line-clamp-3">
                  {preview}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {doc.domain ? (
                  <Badge tone="brand" className="capitalize">
                    {doc.domain}
                  </Badge>
                ) : null}
                {doc.document_type ? (
                  <Badge tone="neutral" className="capitalize">
                    {doc.document_type}
                  </Badge>
                ) : null}
                {doc.scope ? (
                  <Badge tone="ai" className="capitalize">
                    {doc.scope}
                  </Badge>
                ) : null}
                {doc.is_recommended ? (
                  <Badge tone="brand">
                    Recommended
                  </Badge>
                ) : null}
              </div>
              {doc.recommendation_reason ? (
                <p className="text-[11px] leading-relaxed text-[color:var(--color-primary)]">
                  {doc.recommendation_reason}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </Link>
    </motion.div>
  );
}
