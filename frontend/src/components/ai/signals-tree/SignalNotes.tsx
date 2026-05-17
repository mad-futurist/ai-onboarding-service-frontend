"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  Eye,
  Loader2,
  Lock,
  MessageCircle,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtRelative } from "@/lib/format";
import { cn, getInitials } from "@/lib/utils";
import { toApiError } from "@/lib/api";

import {
  listSignalComments,
  postSignalComment,
  reactToSignalNote,
} from "@/services/signals";
import type {
  ID,
  SignalAudience,
  SignalComment,
  SignalCommentVisibility,
} from "@/types";

interface SignalNotesProps {
  signalId: ID;
  audience: SignalAudience;
  userId?: ID | null;
  mentorName?: string;
  newcomerName?: string;
}

const VISIBILITY_OPTIONS: Array<{
  value: SignalCommentVisibility;
  label: string;
  icon: typeof Users;
}> = [
  { value: "shared", label: "Shared", icon: Users },
  { value: "mentor_only", label: "Mentor only", icon: Eye },
  { value: "private", label: "Private", icon: Lock },
];

export function SignalNotes({
  signalId,
  audience,
  userId,
  mentorName,
  newcomerName,
}: SignalNotesProps) {
  const qc = useQueryClient();
  const reduced = useReducedMotion();
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = React.useState("");
  const [visibility, setVisibility] =
    React.useState<SignalCommentVisibility>("shared");

  const { data, isLoading } = useQuery({
    queryKey: ["signal-comments", signalId, audience, userId],
    queryFn: () => listSignalComments(signalId, audience, userId ?? null),
  });

  const entries = React.useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [data],
  );

  React.useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [entries.length, reduced]);

  const post = useMutation({
    mutationFn: () =>
      postSignalComment(signalId, {
        comment: draft.trim(),
        visibility,
        author_role: audience,
        user_id: userId ?? null,
      }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["signal-comments", signalId] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Message sent");
    },
    onError: (e) =>
      toast.error("Could not save message", {
        description: toApiError(e).message,
      }),
  });

  const canSend = draft.trim().length > 0 && !post.isPending;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--color-border)] px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-[color:var(--color-fg)]">
            Signal chat
          </div>
          <div className="text-xs text-[color:var(--color-fg-subtle)]">
            {entries.length
              ? `${entries.length} update${entries.length > 1 ? "s" : ""}`
              : "No messages yet"}
          </div>
        </div>
        <div className="inline-flex rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-0.5">
          {VISIBILITY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = visibility === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setVisibility(option.value)}
                className={cn(
                  "inline-flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-semibold transition-colors",
                  active
                    ? "bg-white text-[color:var(--color-fg)] shadow-sm"
                    : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
                )}
                aria-pressed={active}
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={listRef}
        className="max-h-[360px] space-y-3 overflow-y-auto bg-[color:var(--color-surface-muted)]/40 px-4 py-4"
      >
        {entries.length ? (
          entries.map((entry) =>
            entry.feedback_type === "approve" ||
            entry.feedback_type === "discuss" ? (
              <ReactionEvent
                key={entry.id}
                entry={entry}
                mentorName={mentorName}
                newcomerName={newcomerName}
              />
            ) : (
              <ChatBubble
                key={entry.id}
                entry={entry}
                audience={audience}
                userId={userId ?? null}
                mentorName={mentorName}
                newcomerName={newcomerName}
                signalId={signalId}
              />
            ),
          )
        ) : (
          <div className="rounded-lg border border-dashed border-[color:var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[color:var(--color-fg-muted)]">
            Start the conversation from this signal.
          </div>
        )}
      </div>

      <div className="border-t border-[color:var(--color-border)] bg-white p-3">
        <Textarea
          placeholder={
            audience === "mentor"
              ? "Message the newcomer about this signal..."
              : "Message your mentor about this signal..."
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSend) {
              post.mutate();
            }
          }}
          className="min-h-[84px] resize-none"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <VisibilityHint visibility={visibility} />
          <Button
            size="sm"
            variant="ai"
            disabled={!canSend}
            onClick={() => post.mutate()}
          >
            {post.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send
          </Button>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({
  entry,
  audience,
  userId,
  mentorName,
  newcomerName,
  signalId,
}: {
  entry: SignalComment;
  audience: SignalAudience;
  userId: ID | null;
  mentorName?: string;
  newcomerName?: string;
  signalId: ID;
}) {
  const qc = useQueryClient();
  const role = entry.author_role === "newcomer" ? "newcomer" : "mentor";
  const isMine =
    role === audience && (entry.user_id == null || userId == null || entry.user_id === userId);
  const displayName =
    role === "mentor" ? mentorName ?? "Mentor" : newcomerName ?? "Newcomer";
  const initials = getInitials(displayName);
  const visibility = (entry.visibility ?? "mentor_only") as SignalCommentVisibility;

  const react = useMutation({
    mutationFn: (reaction: "approve" | "discuss") =>
      reactToSignalNote(signalId, {
        reaction,
        author_role: audience,
        user_id: userId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["signal-comments", signalId] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e) =>
      toast.error("Could not save reaction", {
        description: toApiError(e).message,
      }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn("flex gap-2", isMine && "justify-end")}
    >
      {!isMine ? (
        <Avatar className="mt-1 h-8 w-8 shrink-0">
          <AvatarFallback className="bg-[color:var(--color-primary-soft)] text-[11px] font-semibold text-[color:var(--color-primary-active)]">
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : null}

      <div className={cn("max-w-[82%]", isMine && "text-right")}>
        <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[color:var(--color-fg-subtle)]">
          <span className="font-semibold text-[color:var(--color-fg)]">
            {displayName}
          </span>
          <span className="rounded-full bg-white px-1.5 py-0.5 font-semibold uppercase tracking-wider">
            {role}
          </span>
          <span className="inline-flex items-center gap-1">
            <VisibilityGlyph visibility={visibility} className="h-3 w-3" />
            {visibilityLabel(visibility)}
          </span>
          <span>{fmtRelative(entry.created_at)}</span>
        </div>

        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-left text-sm leading-relaxed shadow-sm",
            isMine
              ? "rounded-br-md bg-[color:var(--color-primary)] text-white"
              : "rounded-bl-md border border-[color:var(--color-border)] bg-white text-[color:var(--color-fg)]",
          )}
        >
          {entry.feedback_type === "adjust_request" ? (
            <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
              <ShieldCheck className="h-3 w-3" />
              Plan adjustment
            </div>
          ) : null}
          <p className="whitespace-pre-wrap">{entry.comment}</p>
        </div>

        {!isMine && entry.feedback_type === "comment" ? (
          <div className="mt-1.5 flex items-center gap-1.5">
            <ReactionButton
              kind="approve"
              loading={react.isPending && react.variables === "approve"}
              onClick={() => react.mutate("approve")}
            />
            <ReactionButton
              kind="discuss"
              loading={react.isPending && react.variables === "discuss"}
              onClick={() => react.mutate("discuss")}
            />
          </div>
        ) : null}
      </div>

      {isMine ? (
        <Avatar className="mt-1 h-8 w-8 shrink-0">
          <AvatarFallback className="bg-[color:var(--color-primary)] text-[11px] font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : null}
    </motion.div>
  );
}

function ReactionEvent({
  entry,
  mentorName,
  newcomerName,
}: {
  entry: SignalComment;
  mentorName?: string;
  newcomerName?: string;
}) {
  const role = entry.author_role === "newcomer" ? "newcomer" : "mentor";
  const name = role === "mentor" ? mentorName ?? "Mentor" : newcomerName ?? "Newcomer";
  const isApprove = entry.feedback_type === "approve";

  return (
    <div className="flex justify-center">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
          isApprove
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-800",
        )}
      >
        {isApprove ? <Check className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
        {name} {isApprove ? "approved" : "wants to discuss"} - {fmtRelative(entry.created_at)}
      </span>
    </div>
  );
}

function ReactionButton({
  kind,
  loading,
  onClick,
}: {
  kind: "approve" | "discuss";
  loading: boolean;
  onClick: () => void;
}) {
  const isApprove = kind === "approve";
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="inline-flex h-7 items-center gap-1 rounded-full border border-[color:var(--color-border)] bg-white px-2 text-[11px] font-semibold text-[color:var(--color-fg-muted)] transition-colors hover:bg-[color:var(--color-surface-muted)] disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isApprove ? (
        <Check className="h-3 w-3" />
      ) : (
        <MessageCircle className="h-3 w-3" />
      )}
      {isApprove ? "Approve" : "Discuss"}
    </button>
  );
}

function VisibilityHint({ visibility }: { visibility: SignalCommentVisibility }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-[color:var(--color-fg-subtle)]">
      <VisibilityGlyph visibility={visibility} className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{visibilityLabel(visibility)}</span>
    </span>
  );
}

function VisibilityGlyph({
  visibility,
  className,
}: {
  visibility: SignalCommentVisibility;
  className?: string;
}) {
  if (visibility === "private") return <Lock className={className} />;
  if (visibility === "mentor_only") return <Eye className={className} />;
  return <Users className={className} />;
}

function visibilityLabel(visibility: SignalCommentVisibility) {
  if (visibility === "private") return "Private";
  if (visibility === "mentor_only") return "Mentor only";
  return "Shared";
}
