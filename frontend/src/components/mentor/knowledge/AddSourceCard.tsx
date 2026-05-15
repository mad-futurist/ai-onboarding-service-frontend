"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  Plus,
  Wand2,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { classifyDocument, createDocument } from "@/services/documents";
import { toApiError } from "@/lib/api";

const ACCEPT = ".txt,.md,text/plain,text/markdown";

const DOMAINS = [
  { value: "engineering", label: "Engineering" },
  { value: "hr", label: "HR & People" },
  { value: "product", label: "Product" },
  { value: "finance", label: "Finance" },
  { value: "security", label: "Security" },
  { value: "general", label: "General" },
];

const TYPES = [
  { value: "guide", label: "Guide" },
  { value: "handbook", label: "Handbook" },
  { value: "policy", label: "Policy" },
  { value: "runbook", label: "Runbook" },
  { value: "checklist", label: "Checklist" },
  { value: "reference", label: "Reference" },
];

interface AddSourceCardProps {
  onAdded?: () => void;
}

export function AddSourceCard({ onAdded }: AddSourceCardProps) {
  const qc = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [domain, setDomain] = React.useState("engineering");
  const [docType, setDocType] = React.useState("guide");
  const [sourceType, setSourceType] = React.useState<"text" | "file">("text");
  const [filename, setFilename] = React.useState<string | null>(null);
  const [isOver, setIsOver] = React.useState(false);

  // Track which fields the AI filled — clears when user edits.
  const [aiFilled, setAiFilled] = React.useState<Record<string, boolean>>({});

  const classifyMut = useMutation({
    mutationFn: (input: { content: string; title?: string }) => classifyDocument(input),
  });

  const createMut = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      toast.success("Source added to knowledge base");
      setContent("");
      setTitle("");
      setSummary("");
      setFilename(null);
      setAiFilled({});
      setSourceType("text");
      qc.invalidateQueries({ queryKey: ["kb"] });
      qc.invalidateQueries({ queryKey: ["documents"] });
      onAdded?.();
    },
    onError: (err) =>
      toast.error("Couldn't add document", { description: toApiError(err).message }),
  });

  // Debounced auto-classify when content has enough text
  const lastClassifiedRef = React.useRef<string>("");
  React.useEffect(() => {
    const txt = content.trim();
    if (txt.length < 60) return; // skip until we have meaningful content
    if (txt === lastClassifiedRef.current) return;
    const handle = setTimeout(() => {
      lastClassifiedRef.current = txt;
      classifyMut.mutate(
        { content: txt, title: title || undefined },
        {
          onSuccess: (resp) => {
            // Only auto-fill fields the user hasn't manually overridden.
            const filled: Record<string, boolean> = { ...aiFilled };
            if (!title.trim()) {
              setTitle(resp.title);
              filled.title = true;
            }
            if (!summary.trim()) {
              setSummary(resp.summary);
              filled.summary = true;
            }
            if (!aiFilled.domain && domain === "engineering") {
              setDomain(resp.domain);
              filled.domain = true;
            }
            if (!aiFilled.docType && docType === "guide") {
              setDocType(resp.document_type);
              filled.docType = true;
            }
            setAiFilled(filled);
          },
        },
      );
    }, 600);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.find(
      (f) => /\.(txt|md)$/i.test(f.name) || ["text/plain", "text/markdown"].includes(f.type),
    );
    if (!valid) {
      toast.warning("Only .txt or .md files supported in the dropzone for now.");
      return;
    }
    try {
      const text = await valid.text();
      const baseTitle = valid.name.replace(/\.(txt|md)$/i, "");
      setContent(text);
      setFilename(valid.name);
      setSourceType("file");
      if (!title.trim()) setTitle(baseTitle);
      lastClassifiedRef.current = ""; // force reclassify
    } catch {
      toast.error("Could not read file");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.warning("Drop a file or paste content first.");
      return;
    }
    const baseTitle = title.trim() || (filename ? filename.replace(/\.(txt|md)$/i, "") : "");
    if (!baseTitle) {
      toast.warning("Title is required (the AI usually fills it — wait a sec).");
      return;
    }
    createMut.mutate({
      title: baseTitle,
      content: content.trim(),
      source: filename ? "file_upload" : "manual_paste",
      source_type: sourceType,
      document_type: docType,
      domain,
      role_target: "all",
      scope: "onboarding",
    });
  };

  const aiBusy = classifyMut.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-[color:var(--color-primary)]" /> Add a source
            </CardTitle>
            <CardDescription>
              Drop a .txt / .md file <span className="text-[color:var(--color-fg-faint)]">or</span> paste content.
              The AI proposes a title, summary, domain and type — you stay in control.
            </CardDescription>
          </div>
          {aiBusy ? (
            <Badge tone="ai" size="sm">
              <Loader2 className="h-3 w-3 animate-spin" /> AI classifying…
            </Badge>
          ) : Object.keys(aiFilled).length ? (
            <Badge tone="ai" size="sm">
              <Sparkles className="h-3 w-3" /> AI filled the highlighted fields
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {/* Drop zone + paste */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setIsOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsOver(false);
              if (e.dataTransfer.files.length) {
                void handleFiles(e.dataTransfer.files);
              }
            }}
            className={cn(
              "rounded-xl border-2 border-dashed bg-white transition-colors",
              isOver
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]"
                : "border-[color:var(--color-border-strong)]",
            )}
          >
            <div className="flex items-start gap-3 px-4 pt-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
                {filename ? <FileText className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                {filename ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-[color:var(--color-fg)]">
                      {filename}
                    </span>
                    <Badge tone="success" size="sm">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Loaded
                    </Badge>
                    <button
                      type="button"
                      onClick={() => {
                        setFilename(null);
                        setContent("");
                        setSourceType("text");
                      }}
                      className="text-[11px] text-[color:var(--color-fg-subtle)] underline hover:text-[color:var(--color-fg)]"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-[color:var(--color-fg)]">
                    Drag a <code className="text-[12px]">.txt</code> /{" "}
                    <code className="text-[12px]">.md</code> file here — or paste below.
                  </p>
                )}
                <p className="text-[11px] text-[color:var(--color-fg-subtle)]">
                  As soon as the AI sees enough text, it fills in title, summary, domain and type.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Browse
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    void handleFiles(e.target.files);
                    e.target.value = "";
                  }
                }}
              />
            </div>
            <Textarea
              rows={10}
              placeholder="Or paste the document content here. The AI takes care of the rest."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (filename) {
                  setFilename(null);
                  setSourceType("text");
                }
              }}
              className="border-0 bg-transparent focus-visible:ring-0 font-mono text-[13px] leading-relaxed"
            />
          </div>

          {/* Editable metadata */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldWithAIBadge
              label="Title"
              htmlFor="src-title"
              filled={aiFilled.title}
              onClearBadge={() => setAiFilled((p) => ({ ...p, title: false }))}
            >
              <Input
                id="src-title"
                placeholder="e.g. Deployment Guide"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (aiFilled.title) setAiFilled((p) => ({ ...p, title: false }));
                }}
              />
            </FieldWithAIBadge>

            <FieldWithAIBadge
              label="Domain"
              filled={aiFilled.domain}
              onClearBadge={() => setAiFilled((p) => ({ ...p, domain: false }))}
            >
              <Select
                value={domain}
                onValueChange={(v) => {
                  setDomain(v);
                  setAiFilled((p) => ({ ...p, domain: false }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWithAIBadge>

            <FieldWithAIBadge
              label="Type"
              filled={aiFilled.docType}
              onClearBadge={() => setAiFilled((p) => ({ ...p, docType: false }))}
            >
              <Select
                value={docType}
                onValueChange={(v) => {
                  setDocType(v);
                  setAiFilled((p) => ({ ...p, docType: false }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWithAIBadge>

            <FieldWithAIBadge
              label="AI summary"
              htmlFor="src-summary"
              filled={aiFilled.summary}
              onClearBadge={() => setAiFilled((p) => ({ ...p, summary: false }))}
            >
              <Input
                id="src-summary"
                placeholder="AI will draft a one-liner"
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  if (aiFilled.summary) setAiFilled((p) => ({ ...p, summary: false }));
                }}
              />
            </FieldWithAIBadge>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!content.trim() || classifyMut.isPending}
              onClick={() => {
                lastClassifiedRef.current = "";
                classifyMut.mutate(
                  { content: content.trim(), title: title || undefined },
                  {
                    onSuccess: (resp) => {
                      setTitle(resp.title);
                      setSummary(resp.summary);
                      setDomain(resp.domain);
                      setDocType(resp.document_type);
                      setAiFilled({ title: true, summary: true, domain: true, docType: true });
                      toast.success("AI re-classified");
                    },
                    onError: (err) =>
                      toast.error("AI failed", { description: toApiError(err).message }),
                  },
                );
              }}
            >
              {classifyMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              Re-classify with AI
            </Button>
            <Button type="submit" disabled={createMut.isPending || !content.trim()}>
              <Plus className="h-4 w-4" />
              {createMut.isPending ? "Adding…" : "Add to knowledge base"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldWithAIBadge({
  label,
  htmlFor,
  filled,
  children,
  onClearBadge,
}: {
  label: string;
  htmlFor?: string;
  filled?: boolean;
  children: React.ReactNode;
  onClearBadge?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {filled ? (
          <button
            type="button"
            onClick={onClearBadge}
            className="flex items-center gap-1 rounded-full bg-[color:var(--color-primary-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--color-primary-active)] hover:bg-[color:var(--color-primary-softer)]"
            title="AI suggested this — click to mark as edited"
          >
            <Sparkles className="h-2.5 w-2.5" /> AI
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
