"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Check, Loader2 } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getLessonNote, upsertLessonNote, deleteLessonNote } from "@/services/lessonNotes";
import type { ID, LessonNote } from "@/types";

interface LessonNotesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newcomerId: ID;
  lessonId: ID;
  lessonTitle: string;
}

const AUTOSAVE_DELAY_MS = 600;

export function LessonNotesPanel({
  open,
  onOpenChange,
  newcomerId,
  lessonId,
  lessonTitle,
}: LessonNotesPanelProps) {
  const queryKey = React.useMemo(
    () => ["lesson-note", newcomerId, lessonId] as const,
    [newcomerId, lessonId],
  );
  const qc = useQueryClient();

  const note = useQuery({
    queryKey,
    queryFn: () => getLessonNote(newcomerId, lessonId),
    enabled: open && Number.isFinite(lessonId) && Number.isFinite(newcomerId),
    staleTime: 30_000,
  });

  const [draft, setDraft] = React.useState<string>("");
  const [lastSynced, setLastSynced] = React.useState<string>("");
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [syncedFrom, setSyncedFrom] = React.useState<string | null>(null);

  // Render-time hydration: when the loaded note body (or lesson/open) changes,
  // pull it into the draft once. Same pattern as `progressLoaded` in the
  // surrounding course detail page.
  const remoteBody = note.data?.body ?? "";
  const syncKey = open ? `${lessonId}:${remoteBody}` : null;
  if (open && syncedFrom !== syncKey) {
    setSyncedFrom(syncKey);
    if (draft !== remoteBody) setDraft(remoteBody);
    if (lastSynced !== remoteBody) setLastSynced(remoteBody);
    if (savedAt !== null) setSavedAt(null);
  } else if (!open && syncedFrom !== null) {
    setSyncedFrom(null);
  }

  const save = useMutation({
    mutationFn: async (body: string) => {
      if (body.trim().length === 0) {
        await deleteLessonNote(newcomerId, lessonId);
        return null;
      }
      return upsertLessonNote(newcomerId, lessonId, body);
    },
    onSuccess: (data: LessonNote | null) => {
      qc.setQueryData(queryKey, data);
      setSavedAt(Date.now());
    },
  });

  // Debounced autosave triggered whenever the draft drifts from the last
  // value we synced with the server.
  React.useEffect(() => {
    if (!open) return;
    if (draft === lastSynced) return;
    const t = setTimeout(() => {
      setLastSynced(draft);
      save.mutate(draft);
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, lastSynced, open]);

  const statusLabel = save.isPending
    ? "Saving…"
    : savedAt
      ? "Saved"
      : note.data?.updated_at
        ? "Up to date"
        : "Empty";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
            <Bookmark className="h-3 w-3" /> Lesson notes
          </div>
          <SheetTitle className="truncate pr-6">{lessonTitle}</SheetTitle>
          <SheetDescription>
            Personal notes saved to your account. Auto-saved as you type.
          </SheetDescription>
        </SheetHeader>

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Jot down what stuck out, questions to ask your mentor, things to revisit…"
          className="min-h-[260px] flex-1 resize-none text-sm"
          autoFocus
        />

        <div className="flex items-center justify-between gap-2 text-xs text-[color:var(--color-fg-muted)]">
          <span className="inline-flex items-center gap-1.5">
            {save.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3 text-[color:var(--color-success)]" />
            )}
            {statusLabel}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={draft.trim().length === 0 || save.isPending}
            onClick={() => {
              setDraft("");
              setLastSynced("");
              save.mutate("");
            }}
          >
            Clear
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
