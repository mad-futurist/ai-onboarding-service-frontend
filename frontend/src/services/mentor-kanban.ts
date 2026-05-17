import { api } from "@/lib/api";
import type { ID, OnboardingTask } from "@/types";

export type KanbanStatus = "in_progress" | "in_review" | "blocked";

export interface KanbanNewcomerSummary {
  id: ID;
  full_name: string;
  user_id: ID | null;
  job_title: string | null;
  team: string | null;
}

export interface KanbanLatestSignal {
  id: ID;
  signal_type: string;
  severity: string;
  tone: string;
  title: string;
}

export interface KanbanLastComment {
  id: ID;
  body: string;
  comment_type: string;
  from_status: string | null;
  to_status: string | null;
  created_at: string | null;
}

export interface KanbanTaskCard {
  id: ID;
  title: string;
  description: string | null;
  status: OnboardingTask["status"];
  priority: string;
  task_type: string;
  plan_id: ID;
  week_number: number | null;
  day_number: number | null;
  updated_at: string | null;
  days_in_status: number;
  review_return_count: number;
  urgency_score: number;
  newcomer: KanbanNewcomerSummary;
  latest_signal: KanbanLatestSignal | null;
  last_comment: KanbanLastComment | null;
}

export interface KanbanFilters {
  newcomers: { id: ID; full_name: string }[];
  priorities: string[];
  task_types: string[];
}

export interface KanbanResponse {
  columns: Record<KanbanStatus, KanbanTaskCard[]>;
  filters: KanbanFilters;
}

export interface KanbanQuery {
  statuses?: KanbanStatus[];
  newcomerId?: ID | null;
  priority?: string | null;
  taskType?: string | null;
  hasOpenSignal?: boolean | null;
  search?: string | null;
}

export async function getMentorKanban(
  mentorId: ID,
  query: KanbanQuery = {},
): Promise<KanbanResponse> {
  const params: Record<string, unknown> = {};
  if (query.statuses && query.statuses.length > 0) {
    params.statuses = query.statuses.join(",");
  }
  if (query.newcomerId != null) params.newcomer_id = query.newcomerId;
  if (query.priority) params.priority = query.priority;
  if (query.taskType) params.task_type = query.taskType;
  if (query.hasOpenSignal != null) params.has_open_signal = query.hasOpenSignal;
  if (query.search) params.search = query.search;

  const { data } = await api.get<KanbanResponse>(
    `/mentor/${mentorId}/kanban`,
    { params },
  );
  return data;
}
