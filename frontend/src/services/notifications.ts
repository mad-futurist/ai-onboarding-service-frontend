import { api } from "@/lib/api";
import type { ID } from "@/types";

export type NotificationType =
  | "task_returned_from_review"
  | "task_status_changed"
  | "ai_signal_detected"
  | "ai_signals_detected"
  | "signal_comment"
  | "signal_reaction"
  | "signal_adjustment_requested"
  | "meeting_scheduled"
  | string;

export interface NotificationItem {
  id: ID;
  user_id: ID;
  type: NotificationType;
  title: string;
  body: string;
  related_task_id: ID | null;
  related_comment_id: ID | null;
  related_signal_id: ID | null;
  related_signal_feedback_id: ID | null;
  read_at: string | null;
  created_at: string;
}

export interface ListNotificationsOptions {
  userId: ID;
  unreadOnly?: boolean;
  limit?: number;
}

export async function listNotifications(
  options: ListNotificationsOptions,
): Promise<NotificationItem[]> {
  const { data } = await api.get<NotificationItem[]>("/notifications", {
    params: {
      user_id: options.userId,
      unread_only: options.unreadOnly ?? false,
      limit: options.limit ?? 50,
    },
  });
  return data;
}

export async function getUnreadCount(userId: ID): Promise<number> {
  const { data } = await api.get<{ unread: number }>(
    "/notifications/unread-count",
    { params: { user_id: userId } },
  );
  return data.unread;
}

export async function markNotificationRead(
  notificationId: ID,
): Promise<NotificationItem> {
  const { data } = await api.post<NotificationItem>(
    `/notifications/${notificationId}/read`,
  );
  return data;
}

export async function markAllNotificationsRead(
  userId: ID,
): Promise<{ updated: number }> {
  const { data } = await api.post<{ updated: number }>(
    "/notifications/read-all",
    null,
    { params: { user_id: userId } },
  );
  return data;
}
