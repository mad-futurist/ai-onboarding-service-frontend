"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getKnowledgeBase } from "@/services/documents";
import type { ID } from "@/types";

interface SourcesPickerProps {
  selected: Set<ID>;
  onToggle: (id: ID) => void;
  onSelectAll?: (ids: ID[]) => void;
  maxHeight?: string;
}

export function SourcesPicker({
  selected,
  onToggle,
  onSelectAll,
  maxHeight = "max-h-80",
}: SourcesPickerProps) {
  const { data, isLoading } = useQuery({ queryKey: ["kb"], queryFn: getKnowledgeBase });
  const [search, setSearch] = React.useState("");

  const allDocs = React.useMemo(
    () => data?.groups.flatMap((g) => g.documents) ?? [],
    [data],
  );

  const filtered = React.useMemo(() => {
    if (!search.trim()) return allDocs;
    const q = search.toLowerCase();
    return allDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.domain.toLowerCase().includes(q) ||
        d.document_type.toLowerCase().includes(q),
    );
  }, [allDocs, search]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    );
  }

  if (!allDocs.length) {
    return (
      <p className="text-sm text-[color:var(--color-fg-muted)]">
        No documents yet. Add some in the Knowledge Base.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-fg-faint)]" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search sources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {onSelectAll ? (
          <button
            type="button"
            onClick={() =>
              onSelectAll(
                selected.size === filtered.length ? [] : filtered.map((d) => d.id),
              )
            }
            className="text-xs font-medium text-[color:var(--color-primary)] hover:underline"
          >
            {selected.size === filtered.length ? "Clear" : "Select all"}
          </button>
        ) : null}
      </div>
      <ul className={`space-y-1 overflow-y-auto pr-1 ${maxHeight}`}>
        {filtered.map((doc) => {
          const isSelected = selected.has(doc.id);
          return (
            <li
              key={doc.id}
              className="flex items-start gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)]"
            >
              <Checkbox
                id={`src-${doc.id}`}
                checked={isSelected}
                onCheckedChange={() => onToggle(doc.id)}
                className="mt-0.5"
              />
              <Label htmlFor={`src-${doc.id}`} className="flex-1 cursor-pointer text-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-subtle)]" />
                  <span className="truncate text-[color:var(--color-fg)]">{doc.title}</span>
                </div>
                <div className="ml-5 text-[11px] text-[color:var(--color-fg-subtle)]">
                  {doc.domain} · {doc.document_type}
                </div>
              </Label>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="px-2 py-1.5 text-xs text-[color:var(--color-fg-muted)]">
            No source matches that search.
          </li>
        ) : null}
      </ul>
      <p className="text-[11px] text-[color:var(--color-fg-subtle)]">
        {selected.size} of {allDocs.length} selected
      </p>
    </div>
  );
}
