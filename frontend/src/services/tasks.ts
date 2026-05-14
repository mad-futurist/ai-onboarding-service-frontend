import { api } from "@/lib/api";
import type { OnboardingTask, TaskDetailResponse, ID } from "@/types";

export async function listTasksForPlan(planId: ID): Promise<OnboardingTask[]> {
  const { data } = await api.get<OnboardingTask[]>(`/tasks/plans/${planId}`);
  return data;
}

export async function getTaskDetail(taskId: ID): Promise<TaskDetailResponse> {
  const { data } = await api.get<TaskDetailResponse>(`/tasks/${taskId}/detail`);
  return data;
}

export async function getTask(taskId: ID): Promise<OnboardingTask> {
  const { data } = await api.get<OnboardingTask>(`/tasks/${taskId}`);
  return data;
}

export async function updateTaskStatus(taskId: ID, status: OnboardingTask["status"]): Promise<OnboardingTask> {
  const { data } = await api.patch<OnboardingTask>(`/tasks/${taskId}/status`, { status });
  return data;
}
