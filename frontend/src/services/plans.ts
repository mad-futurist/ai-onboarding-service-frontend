import { api } from "@/lib/api";
import type {
  AIPlanGenerationResponse,
  OnboardingPlan,
  OnboardingPlanWithTasks,
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
