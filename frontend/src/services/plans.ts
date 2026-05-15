import { api } from "@/lib/api";
import type {
  AIPlanGenerationResponse,
  OnboardingPlan,
  OnboardingPlanWithTasks,
  PlanRegenerateRequest,
  PlanRegenerateResponse,
  Sprint,
  Week,
  ID,
} from "@/types";

export interface GeneratePlanInput {
  newcomer_id: ID;
  mentor_notes?: string;
  document_ids?: ID[];
}

export async function generatePlan(input: GeneratePlanInput): Promise<AIPlanGenerationResponse> {
  const { data } = await api.post<AIPlanGenerationResponse>("/onboarding-plans/generate", input);
  return data;
}

export async function getPlan(id: ID): Promise<OnboardingPlanWithTasks> {
  const { data } = await api.get<OnboardingPlanWithTasks>(`/onboarding-plans/${id}`);
  return data;
}

export async function approvePlan(id: ID): Promise<OnboardingPlan> {
  const { data } = await api.patch<OnboardingPlan>(`/onboarding-plans/${id}/approve`);
  return data;
}

export async function regeneratePlan(
  planId: ID,
  payload: PlanRegenerateRequest,
): Promise<PlanRegenerateResponse> {
  const { data } = await api.post<PlanRegenerateResponse>(
    `/onboarding-plans/${planId}/regenerate`,
    payload,
  );
  return data;
}

export async function listWeeks(planId: ID): Promise<Week[]> {
  const { data } = await api.get<Week[]>(`/onboarding-plans/${planId}/weeks`);
  return data;
}

export interface WeekCreateInput {
  index?: number;
  title: string;
  summary?: string | null;
  goals?: string[] | null;
  sprint_id?: ID | null;
}

export async function createWeek(planId: ID, payload: WeekCreateInput): Promise<Week> {
  const { data } = await api.post<Week>(`/onboarding-plans/${planId}/weeks`, payload);
  return data;
}

export interface WeekUpdateInput {
  index?: number;
  title?: string;
  summary?: string | null;
  goals?: string[] | null;
  sprint_id?: ID | null;
}

export async function updateWeek(weekId: ID, payload: WeekUpdateInput): Promise<Week> {
  const { data } = await api.patch<Week>(`/onboarding-plans/weeks/${weekId}`, payload);
  return data;
}

export async function listSprints(planId: ID): Promise<Sprint[]> {
  const { data } = await api.get<Sprint[]>(`/onboarding-plans/${planId}/sprints`);
  return data;
}
