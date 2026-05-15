"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  MessageCircle,
  Pencil,
  Send,
  Sparkles,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtRelative } from "@/lib/format";
import { getInitials } from "@/lib/utils";

import {
  listSignalComments,
  postSignalComment,
  reactToSignalNote,
} from "@/services/signals";
import type { ID, SignalAudience, SignalComment } from "@/types";

interface SignalNotesProps {
  signalId: ID;
  audience: SignalAudience;
  userId?: ID | null;
  mentorName?: string;
  newcomerName?: string;
}

/**
 * One note per role, plus a single Approve/Discuss reaction from the other role.
 * No threaded chat — keeps the surface calm and intentional.
 */
export function SignalNotes({
  signalId,
  audience,
  userId,
  mentorName,
  newcomerName,
}: SignalNotesProps) {
  const qc = useQueryClient();
  const reduced = useReducedMotion();

  const { data, isLoading } = useQuery({
    queryKey: ["signal-comments", signalId, audience, userId],
    queryFn: () => listSignalComments(signalId, audience, userId ?? null),
  });

  // Latest "comment" entry per role
  const mentorNote = React.useMemo(
    () => latestOf(data, "mentor", "comment"),
    [data],
  );
  const newcomerNote = React.useMemo(
    () => latestOf(data, "newcomer", "comment"),
    [data],
  );

  // Latest reaction from the OPPOSITE role about each note
  const mentorNoteReaction = React.useMemo(
    () => latestReactionAfter(data, "newcomer", mentorNote?.created_at),
    [data, mentorNote],
  );
  const newcomerNoteReaction = React.useMemo(
    () => latestReactionAfter(data, "mentor", newcomerNote?.created_at),
    [data, newcomerNote],
  );

  const mineNote = audience === "mentor" ? mentorNote : newcomerNote;
  const theirNote = audience === "mentor" ? newcomerNote : mentorNote;
  const theirReactionOnMine = audience === "mentor" ? mentorNoteReaction : newcomerNoteReaction;
  const myReactionOnTheirs = audience === "mentor" ? newcomerNoteReaction : mentorNoteReaction;

  const myName = audience === "mentor" ? mentorName ?? "Mentor" : newcomerName ?? "You";
  const theirName = audience === "mentor" ? newcomerName ?? "Newcomer" : mentorName ?? "Mentor";
  const theirRoleLabel = audience === "mentor" ? "Newcomer" : "Mentor";

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    );
  }

  const fadeIn = reduced ? undefined : true;

  return (
    <div className="space-y-3">
      {/* THEIR note (read-only + my reaction chips) */}
      <NoteCard
        side="them"
        roleLabel={theirRoleLabel}
        displayName={theirName}
        note={theirNote}
        signalId={signalId}
        audience={audience}
        userId={userId}
        myReaction={myReactionOnTheirs}
        fadeIn={fadeIn}
      />

      {/* MY note (editable) */}
      <MyNoteCard
        key={mineNote?.id ?? "new"}
        signalId={signalId}
        audience={audience}
        userId={userId}
        myName={myName}
        existingNote={mineNote}
        theirReaction={theirReactionOnMine}
        theirName={theirName}
        fadeIn={fadeIn}
        onSaved={() => qc.invalidateQueries({ queryKey: ["signal-comments", signalId] })}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

interface NoteCardProps {
  side: "me" | "them";
  roleLabel: string;
  displayName: string;
  note: SignalComment | null;
  signalId: ID;
  audience: SignalAudience;
  userId?: ID | null;
  myReaction: SignalComment | null;
  fadeIn?: boolean;
}

function NoteCard({
  roleLabel,
  displayName,
  note,
  signalId,
  audience,
  userId,
  myReaction,
  fadeIn,
}: NoteCardProps) {
  const qc = useQueryClient();
  const reactionType = (myReaction?.feedback_type ?? null) as
    | "approve"
    | "discuss"
    | null;

  const react = useMutation({
    mutationFn: (reaction: "approve" | "discuss") =>
      reactToSignalNote(signalId, {
        reaction,
        author_role: audience,
        user_id: userId ?? null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["signal-comments", signalId] });
    },
    onError: () => toast.error("Could not save reaction"),
  });

  if (!note) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-dashed border-[color:var(--color-border)] bg-white/60 p-4 backdrop-blur"
      >
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-fg-faint)]">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-faint)]">
              {roleLabel}&apos;s note
            </div>
            <div className="text-xs text-[color:var(--color-fg-muted)]">
              No note yet — waiting on {displayName}.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = getInitials(displayName);

  return (
    <motion.div
      initial={fadeIn ? { opacity: 0, y: 4 } : false}
      animate={fadeIn ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]"
    >
      {/* Soft gradient sheen along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-200 via-pink-200 to-violet-200 opacity-80" />

      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white">
          <AvatarFallback className="bg-gradient-to-br from-orange-100 via-pink-100 to-violet-100 text-[11px] font-semibold text-[color:var(--color-primary-active)]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-[color:var(--color-fg)]">{displayName}</span>
            <span className="rounded-full bg-[color:var(--color-primary-soft)] px-1.5 py-0.5 font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
              {roleLabel}
            </span>
            <span className="ml-auto text-[color:var(--color-fg-faint)]">
              {fmtRelative(note.created_at)}
            </span>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
            {note.comment}
          </p>

          {/* Reaction row */}
          <div className="mt-3 flex items-center gap-2">
            <ReactionChip
              kind="approve"
              active={reactionType === "approve"}
              loading={react.isPending && react.variables === "approve"}
              onClick={() => react.mutate("approve")}
            />
            <ReactionChip
              kind="discuss"
              active={reactionType === "discuss"}
              loading={react.isPending && react.variables === "discuss"}
              onClick={() => react.mutate("discuss")}
            />
            <AnimatePresence>
              {reactionType ? (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-[color:var(--color-fg-faint)]"
                >
                  You {reactionType === "approve" ? "approved" : "want to discuss"} ·{" "}
                  {fmtRelative(myReaction!.created_at)}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface MyNoteCardProps {
  signalId: ID;
  audience: SignalAudience;
  userId?: ID | null;
  myName: string;
  existingNote: SignalComment | null;
  theirReaction: SignalComment | null;
  theirName: string;
  fadeIn?: boolean;
  onSaved: () => void;
}

function MyNoteCard({
  signalId,
  audience,
  userId,
  myName,
  existingNote,
  theirReaction,
  theirName,
  fadeIn,
  onSaved,
}: MyNoteCardProps) {
  // Reset local state when we switch to a different note (different id) — using
  // the existing note's id as a key on this component avoids a setState-in-effect.
  const [editing, setEditing] = React.useState(!existingNote);
  const [draft, setDraft] = React.useState(existingNote?.comment ?? "");

  const post = useMutation({
    mutationFn: () =>
      postSignalComment(signalId, {
        comment: draft.trim(),
        visibility: "shared",
        author_role: audience,
        user_id: userId ?? null,
      }),
    onSuccess: () => {
      setEditing(false);
      onSaved();
      toast.success(existingNote ? "Note updated" : "Note saved");
    },
    onError: () => toast.error("Could not save note"),
  });

  const initials = getInitials(myName);
  const canSend = draft.trim().length > 0 && !post.isPending;
  const reactionType = (theirReaction?.feedback_type ?? null) as
    | "approve"
    | "discuss"
    | null;

  return (
    <motion.div
      initial={fadeIn ? { opacity: 0, y: 4 } : false}
      animate={fadeIn ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.22, ease: "easeOut", delay: 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-[color:var(--color-primary-ring)] bg-gradient-to-br from-white via-white to-orange-50/40 p-4 shadow-[var(--shadow-card)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-orange-200/40 via-pink-200/40 to-violet-200/40 blur-2xl" />

      <div className="relative flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white">
          <AvatarFallback className="bg-gradient-to-br from-orange-200 via-pink-200 to-violet-200 text-[11px] font-semibold text-[color:var(--color-primary-active)]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-[color:var(--color-fg)]">{myName}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary-soft)] px-1.5 py-0.5 font-semibold uppercase tracking-wider text-[color:var(--color-primary-active)]">
              <Sparkles className="h-3 w-3" /> Your note
            </span>
            {existingNote && !editing ? (
              <span className="ml-auto text-[color:var(--color-fg-faint)]">
                {fmtRelative(existingNote.created_at)}
              </span>
            ) : null}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                placeholder={
                  audience === "mentor"
                    ? "Write a single note for the newcomer about this signal…"
                    : "Write a single note for your mentor about this signal…"
                }
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[88px] border-[color:var(--color-primary-ring)] focus-visible:border-[color:var(--color-primary)]"
              />
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[color:var(--color-fg-faint)]">
                  Shared with {theirName}. They can Approve or ask to Discuss.
                </span>
                {existingNote ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => {
                      setDraft(existingNote.comment ?? "");
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ai"
                  className={existingNote ? "" : "ml-auto"}
                  disabled={!canSend}
                  onClick={() => post.mutate()}
                >
                  <Send className="h-3.5 w-3.5" />
                  {post.isPending ? "Saving…" : existingNote ? "Update" : "Send"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
                {existingNote?.comment}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {reactionType ? (
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      reactionType === "approve"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800",
                    ].join(" ")}
                  >
                    {reactionType === "approve" ? (
                      <>
                        <ShieldCheck className="h-3 w-3" /> {theirName} approved
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-3 w-3" /> {theirName} wants to discuss
                      </>
                    )}
                  </span>
                ) : (
                  <span className="text-[11px] text-[color:var(--color-fg-faint)]">
                    Waiting on {theirName}&apos;s reaction.
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReactionChip({
  kind,
  active,
  loading,
  onClick,
}: {
  kind: "approve" | "discuss";
  active: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  const isApprove = kind === "approve";
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all",
        active
          ? isApprove
            ? "border-emerald-300 bg-emerald-100 text-emerald-700 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
            : "border-amber-300 bg-amber-100 text-amber-800 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]"
          : "border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)]",
        loading ? "opacity-60" : "",
      ].join(" ")}
    >
      {isApprove ? <Check className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
      {isApprove ? "Approve" : "Discuss"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function latestOf(
  comments: SignalComment[] | undefined,
  role: SignalAudience,
  feedbackType: string,
): SignalComment | null {
  if (!comments?.length) return null;
  const filtered = comments.filter(
    (c) => c.author_role === role && c.feedback_type === feedbackType,
  );
  if (!filtered.length) return null;
  return filtered.reduce((latest, c) =>
    new Date(c.created_at).getTime() > new Date(latest.created_at).getTime() ? c : latest,
  );
}

function latestReactionAfter(
  comments: SignalComment[] | undefined,
  role: SignalAudience,
  afterIso: string | undefined,
): SignalComment | null {
  if (!comments?.length || !afterIso) return null;
  const after = new Date(afterIso).getTime();
  const reactions = comments.filter(
    (c) =>
      c.author_role === role &&
      (c.feedback_type === "approve" || c.feedback_type === "discuss") &&
      new Date(c.created_at).getTime() >= after,
  );
  if (!reactions.length) return null;
  return reactions.reduce((latest, c) =>
    new Date(c.created_at).getTime() > new Date(latest.created_at).getTime() ? c : latest,
  );
}
