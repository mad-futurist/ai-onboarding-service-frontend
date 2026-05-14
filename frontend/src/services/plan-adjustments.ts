import { api } from "@/lib/api";
import type { PlanAdjustment, ID } from "@/types";

export async function listPlanAdjustments(planId: ID): Promise<PlanAdjustment[]> {
  const { data } = await api.get<PlanAdjustment[]>("/plan-adjustments/", { params: { plan_id: planId } });
  return data;
}

export async function approvePlanAdjustment(adjustmentId: ID) {
  const { data } = await api.patch(`/plan-adjustments/${adjustmentId}/approve`);
  return data;
}
