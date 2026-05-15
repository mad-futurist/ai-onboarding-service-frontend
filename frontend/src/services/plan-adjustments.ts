import { api } from "@/lib/api";
import type { ID, PlanAdjustment } from "@/types";

export interface PlanAdjustmentStatusResponse {
  id: ID;
  status: string;
  reviewed_at?: string | null;
  applied_at?: string | null;
}

export async function listAdjustmentsForNewcomer(
  newcomerId: ID,
  status?: string,
): Promise<PlanAdjustment[]> {
  const { data } = await api.get<PlanAdjustment[]>(
    `/plan-adjustments/newcomers/${newcomerId}`,
    { params: status ? { status } : undefined },
  );
  return data;
}

export async function approveAdjustment(id: ID): Promise<PlanAdjustmentStatusResponse> {
  const { data } = await api.patch<PlanAdjustmentStatusResponse>(`/plan-adjustments/${id}/approve`);
  return data;
}

export async function applyAdjustment(id: ID): Promise<PlanAdjustmentStatusResponse> {
  const { data } = await api.post<PlanAdjustmentStatusResponse>(`/plan-adjustments/${id}/apply`);
  return data;
}
