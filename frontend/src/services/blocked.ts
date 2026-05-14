import { api } from "@/lib/api";
import type { BlockedReport, ID } from "@/types";

export interface CreateBlockedInput {
  newcomer_id: ID;
  task_id?: ID;
  blocker_type: string;
  details?: string;
}

export async function createBlockedReport(input: CreateBlockedInput): Promise<BlockedReport> {
  const { data } = await api.post<BlockedReport>("/blocked-reports/", input);
  return data;
}

export async function listBlockedForNewcomer(newcomerId: ID): Promise<BlockedReport[]> {
  const { data } = await api.get<BlockedReport[]>(`/blocked-reports/newcomers/${newcomerId}`);
  return data;
}

export async function resolveBlocked(reportId: ID) {
  const { data } = await api.patch(`/blocked-reports/${reportId}/resolve`);
  return data;
}
