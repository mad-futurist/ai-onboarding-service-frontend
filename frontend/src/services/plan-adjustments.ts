import { api } from "@/lib/api";
import type { ID } from "@/types";

export interface PlanAdjustmentStatusResponse {
  id: ID;
  status: string;
  reviewed_at?: string | null;
  applied_at?: string | null;
}

export async function approveAdjustment(id: ID): Promise<PlanAdjustmentStatusResponse> {
  const { data } = await api.patch<PlanAdjustmentStatusResponse>(`/plan-adjustments/${id}/approve`);
  return data;
}

export async function applyAdjustment(id: ID): Promise<PlanAdjustmentStatusResponse> {
  const { data } = await api.post<PlanAdjustmentStatusResponse>(`/plan-adjustments/${id}/apply`);
  return data;
}
