"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, CheckCheck, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/services/notifications";
import { subscribeNotifications } from "@/lib/notification-bus";
import { useDemo } from "@/providers/demo-provider";

function formatTimeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const { activePersona, mentorId, newcomerId, personas, role } = useDemo();
  const fallbackPersona =
    role === "mentor"
      ? personas.find((persona) => persona.role === "mentor" && persona.user_id === mentorId)
      : personas.find(
          (persona) =>
            persona.role === "newcomer" &&
            persona.newcomer_id === newcomerId,
        );
  const userId =
    activePersona?.user_id ??
    fallbackPersona?.user_id ??
    (role === "mentor" ? mentorId : null);
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () =>
      listNotifications({ userId: userId!, unreadOnly: true, limit: 12 }),
    enabled: !!userId,
    refetchInterval: open ? false : 30_000,
  });

  React.useEffect(() => {
    if (open && userId) void refetch();
  }, [open, refetch, userId]);

  React.useEffect(() => {
    if (!userId) return;
    return subscribeNotifications(() => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      void refetch();
    });
  }, [qc, refetch, userId]);

  const notifications = data ?? [];
  const unreadCount = notifications.length;

  const readMut = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onMutate: async (id) => {
      if (!userId) return;
      const queryKey = ["notifications", userId] as const;
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<NotificationItem[]>(queryKey);
      qc.setQueryData<NotificationItem[]>(queryKey, (current) =>
        (current ?? []).filter((notification) => notification.id !== id),
      );
      return { previous, queryKey };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const readAllMut = useMutation({
    mutationFn: () =>
      userId
        ? markAllNotificationsRead(userId)
        : Promise.resolve({ updated: 0 }),
    onSuccess: () => {
      if (userId) {
        qc.setQueryData<NotificationItem[]>(["notifications", userId], []);
      }
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleClickItem = (n: NotificationItem) => {
    if (!n.read_at) readMut.mutate(n.id);
    setOpen(false);
    if (n.type.startsWith("meeting_")) {
      router.push(role === "newcomer" ? "/newcomer/calendar" : "/mentor/meetings");
    } else if (n.related_signal_id) {
      router.push(role === "newcomer" ? "/newcomer/signals" : "/mentor/signals");
    } else if (n.related_task_id) {
      router.push(role === "newcomer" ? `/newcomer/tasks/${n.related_task_id}` : "/mentor/kanban");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative grid h-9 w-9 place-items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)] transition-colors",
            unreadCount > 0 && "text-[color:var(--color-fg)]",
          )}
          aria-label="Notifications"
          data-demo-id="notification-bell"
        >
          <BellRing className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[color:var(--color-danger)] px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[80] w-[320px] max-h-[70vh] overflow-hidden bg-[color:var(--color-surface-elevated)] p-0 text-[color:var(--color-fg)]"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-3 py-2">
          <span className="text-sm font-semibold tracking-tight">
            Notifications
          </span>
          <button
            type="button"
            onClick={() => readAllMut.mutate()}
            disabled={
              !userId || readAllMut.isPending || unreadCount === 0
            }
            className="inline-flex items-center gap-1 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] disabled:opacity-50"
          >
            {readAllMut.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCheck className="h-3 w-3" />
            )}
            Mark all read
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-6 text-center text-xs text-[color:var(--color-fg-subtle)]">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-[color:var(--color-fg-subtle)]">
              No unread notifications.
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--color-border)]">
              {notifications.map((n, index) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClickItem(n)}
                    data-demo-id={index === 0 ? "notifications-first-item" : undefined}
                    className={cn(
                      "block w-full px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--color-surface-muted)]",
                      !n.read_at && "bg-[color:var(--color-primary-soft)]/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-[color:var(--color-fg)] line-clamp-1">
                        {n.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-[color:var(--color-fg-subtle)]">
                        {formatTimeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.body ? (
                      <p className="mt-1 text-xs text-[color:var(--color-fg-muted)] line-clamp-2 whitespace-pre-wrap">
                        {n.body}
                      </p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
