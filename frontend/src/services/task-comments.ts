import { api } from "@/lib/api";
import type { ID } from "@/types";

export type TaskCommentType =
  | "general"
  | "review_return"
  | "status_change"
  | "system";

export interface TaskComment {
  id: ID;
  task_id: ID;
  author_user_id: ID | null;
  body: string;
  comment_type: TaskCommentType;
  from_status: string | null;
  to_status: string | null;
  created_at: string;
}

export async function listTaskComments(taskId: ID): Promise<TaskComment[]> {
  const { data } = await api.get<TaskComment[]>(`/tasks/${taskId}/comments`);
  return data;
}

export async function createTaskComment(
  taskId: ID,
  body: string,
  options?: { commentType?: TaskCommentType; authorUserId?: ID | null },
): Promise<TaskComment> {
  const payload: Record<string, unknown> = {
    body,
    comment_type: options?.commentType ?? "general",
  };
  if (options?.authorUserId !== undefined && options.authorUserId !== null) {
    payload.author_user_id = options.authorUserId;
  }
  const { data } = await api.post<TaskComment>(
    `/tasks/${taskId}/comments`,
    payload,
  );
  return data;
}
