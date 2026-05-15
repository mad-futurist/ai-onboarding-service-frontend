"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createDocument } from "@/services/documents";
import { toApiError } from "@/lib/api";

const ACCEPT = ".txt,.md,text/plain,text/markdown";

interface KbDropzoneProps {
  defaultDomain?: string;
  defaultDocType?: string;
}

interface UploadItem {
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function KbDropzone({ defaultDomain = "engineering", defaultDocType = "guide" }: KbDropzoneProps) {
  const qc = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = React.useState(false);
  const [items, setItems] = React.useState<UploadItem[]>([]);

  const uploadMut = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createDocument({
        title,
        content,
        source: "file_upload",
        document_type: defaultDocType,
        domain: defaultDomain,
        role_target: "all",
        scope: "onboarding",
      }),
  });

  const processFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      const valid = arr.filter((f) =>
        /\.(txt|md)$/i.test(f.name) || ["text/plain", "text/markdown"].includes(f.type),
      );
      const rejected = arr.length - valid.length;
      if (rejected > 0) {
        toast.warning(`${rejected} file${rejected > 1 ? "s" : ""} skipped`, {
          description: "Only .txt and .md files are supported for drag-and-drop.",
        });
      }
      if (!valid.length) return;

      setItems((prev) => [
        ...prev,
        ...valid.map<UploadItem>((f) => ({ name: f.name, status: "pending" })),
      ]);

      for (const file of valid) {
        setItems((prev) =>
          prev.map((it) => (it.name === file.name ? { ...it, status: "uploading" } : it)),
        );
        try {
          const content = await file.text();
          const title = file.name.replace(/\.(txt|md)$/i, "");
          await uploadMut.mutateAsync({ title, content });
          setItems((prev) =>
            prev.map((it) => (it.name === file.name ? { ...it, status: "done" } : it)),
          );
        } catch (err) {
          const msg = toApiError(err).message;
          setItems((prev) =>
            prev.map((it) =>
              it.name === file.name ? { ...it, status: "error", error: msg } : it,
            ),
          );
          toast.error(`Failed to ingest ${file.name}`, { description: msg });
        }
      }

      qc.invalidateQueries({ queryKey: ["kb"] });
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Sources ingested", {
        description: `${valid.length} file${valid.length > 1 ? "s" : ""} added to your knowledge base.`,
      });
    },
    [qc, uploadMut],
  );

  return (
    <div className="space-y-3">
      <label
        htmlFor="kb-dropzone-input"
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
            void processFiles(e.dataTransfer.files);
          }
        }}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition-colors",
          isOver
            ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]"
            : "border-[color:var(--color-border-strong)] hover:border-[color:var(--color-primary-ring)] hover:bg-[color:var(--color-primary-soft)]/50",
        )}
      >
        <div
          className={cn(
            "grid h-12 w-12 place-items-center rounded-full transition-colors",
            isOver
              ? "bg-white text-[color:var(--color-primary)]"
              : "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)] group-hover:bg-white",
          )}
        >
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-[color:var(--color-fg)]">
            Drag and drop files here
          </p>
          <p className="text-xs text-[color:var(--color-fg-muted)]">
            .txt and .md files. They&apos;ll be ingested into the knowledge base and embedded for the AI.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            inputRef.current?.click();
          }}
        >
          Browse files
        </Button>
        <input
          ref={inputRef}
          id="kb-dropzone-input"
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) {
              void processFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </label>

      {items.length ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-subtle)]" />
                <span className="truncate text-[color:var(--color-fg)]">{item.name}</span>
              </div>
              {item.status === "uploading" ? (
                <span className="flex items-center gap-1 text-xs text-[color:var(--color-fg-muted)]">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                </span>
              ) : item.status === "done" ? (
                <span className="text-xs font-medium text-[color:var(--color-success-fg)]">
                  Ingested
                </span>
              ) : item.status === "error" ? (
                <span className="text-xs text-[color:var(--color-danger-fg)]">{item.error}</span>
              ) : (
                <span className="text-xs text-[color:var(--color-fg-faint)]">Queued</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
