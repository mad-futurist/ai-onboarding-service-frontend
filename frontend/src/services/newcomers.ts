import { api } from "@/lib/api";
import type { Newcomer, OnboardingPlanWithTasks, ID } from "@/types";

export async function listNewcomers(): Promise<Newcomer[]> {
  const { data } = await api.get<Newcomer[]>("/newcomers/");
  return data;
}

export async function getNewcomer(id: ID): Promise<Newcomer> {
  const { data } = await api.get<Newcomer>(`/newcomers/${id}`);
  return data;
}

export async function getNewcomerPlan(id: ID): Promise<OnboardingPlanWithTasks> {
  const { data } = await api.get<OnboardingPlanWithTasks>(`/newcomers/${id}/onboarding-plan`);
  return data;
}

export interface CreateNewcomerInput {
  email: string;
  full_name: string;
  job_title: string;
  seniority: string;
  team: string;
  start_date?: string | null;
  mentor_id?: ID | null;
  main_goal?: string;
  known_skills?: string;
  known_gaps?: string;
}

export async function createNewcomer(input: CreateNewcomerInput): Promise<Newcomer> {
  const { data } = await api.post<Newcomer>("/newcomers/", input);
  return data;
}
