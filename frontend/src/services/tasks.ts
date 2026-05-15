import { api } from "@/lib/api";
import type {
  OnboardingTask,
  TaskDetailResponse,
  TaskExample,
  TaskLink,
  TaskAISuggestResponse,
  TaskAIField,
  ID,
} from "@/types";

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

export async function updateTaskStatus(
  taskId: ID,
  status: OnboardingTask["status"],
): Promise<OnboardingTask> {
  const { data } = await api.patch<OnboardingTask>(`/tasks/${taskId}/status`, { status });
  return data;
}

export interface TaskCreateInput {
  plan_id: ID;
  title: string;
  description?: string | null;
  week_number?: number | null;
  day_number?: number | null;
  week_id?: ID | null;
  sprint_id?: ID | null;
  task_type?: string;
  priority?: string;
  success_criteria?: string | null;
  acceptance_criteria?: string | null;
  examples?: TaskExample[] | null;
  links?: TaskLink[] | null;
}

export async function createTask(payload: TaskCreateInput): Promise<OnboardingTask> {
  const { data } = await api.post<OnboardingTask>("/tasks", payload);
  return data;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  week_number?: number | null;
  day_number?: number | null;
  week_id?: ID | null;
  sprint_id?: ID | null;
  task_type?: string;
  priority?: string;
  success_criteria?: string | null;
  acceptance_criteria?: string | null;
  examples?: TaskExample[] | null;
  links?: TaskLink[] | null;
}

export async function updateTask(taskId: ID, payload: TaskUpdateInput): Promise<OnboardingTask> {
  const { data } = await api.patch<OnboardingTask>(`/tasks/${taskId}`, payload);
  return data;
}

export interface TaskAIGenerateInput {
  plan_id: ID;
  week_id?: ID | null;
  sprint_id?: ID | null;
  prompt_hint: string;
  document_ids?: ID[];
}

export async function aiGenerateTask(payload: TaskAIGenerateInput): Promise<OnboardingTask> {
  const { data } = await api.post<OnboardingTask>("/tasks/ai-generate", payload);
  return data;
}

export async function aiSuggestField(
  taskId: ID,
  field: TaskAIField,
  instruction?: string,
): Promise<TaskAISuggestResponse> {
  const { data } = await api.post<TaskAISuggestResponse>(`/tasks/${taskId}/ai-suggest`, {
    field,
    instruction,
  });
  return data;
}

export async function deleteTask(taskId: ID): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}
