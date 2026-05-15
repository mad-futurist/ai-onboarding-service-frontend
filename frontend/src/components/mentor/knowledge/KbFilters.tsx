"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface KbFilterState {
  domain: string;
  docType: string;
  search: string;
}

export const KB_DOMAINS = [
  { value: "all", label: "All domains" },
  { value: "engineering", label: "Engineering" },
  { value: "hr", label: "HR & People" },
  { value: "product", label: "Product" },
  { value: "finance", label: "Finance" },
  { value: "security", label: "Security" },
  { value: "general", label: "General" },
];

export const KB_TYPES = [
  { value: "all", label: "All types" },
  { value: "guide", label: "Guide" },
  { value: "handbook", label: "Handbook" },
  { value: "policy", label: "Policy" },
  { value: "runbook", label: "Runbook" },
  { value: "checklist", label: "Checklist" },
  { value: "reference", label: "Reference" },
];

interface KbFiltersProps {
  value: KbFilterState;
  onChange: (next: KbFilterState) => void;
  total?: number;
}

export function KbFilters({ value, onChange, total }: KbFiltersProps) {
  const dirty =
    value.domain !== "all" || value.docType !== "all" || value.search.trim() !== "";
  return (
    <div className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px] space-y-1.5">
          <Label htmlFor="kb-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-fg-faint)]" />
            <Input
              id="kb-search"
              className="pl-8"
              placeholder="Search title…"
              value={value.search}
              onChange={(e) => onChange({ ...value, search: e.target.value })}
            />
          </div>
        </div>
        <div className="w-44 space-y-1.5">
          <Label>Domain</Label>
          <Select
            value={value.domain}
            onValueChange={(v) => onChange({ ...value, domain: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KB_DOMAINS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44 space-y-1.5">
          <Label>Type</Label>
          <Select
            value={value.docType}
            onValueChange={(v) => onChange({ ...value, docType: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KB_TYPES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {dirty ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ domain: "all", docType: "all", search: "" })}
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        ) : null}
      </div>
      {typeof total === "number" ? (
        <p className="mt-3 text-xs text-[color:var(--color-fg-subtle)]">
          {total} result{total === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
