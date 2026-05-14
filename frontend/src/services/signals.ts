import { api } from "@/lib/api";
import type { AISignal, AISignalDetectionResponse, ID } from "@/types";

export async function listSignals(params?: { status?: string }): Promise<AISignal[]> {
  const { data } = await api.get<AISignal[]>("/ai-signals/", { params });
  return data;
}

export async function listSignalsForNewcomer(newcomerId: ID, status?: string): Promise<AISignal[]> {
  const { data } = await api.get<AISignal[]>(`/ai-signals/newcomers/${newcomerId}`, {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function detectSignals(newcomerId: ID): Promise<AISignalDetectionResponse> {
  const { data } = await api.post<AISignalDetectionResponse>(`/ai-signals/detect/newcomers/${newcomerId}`);
  return data;
}

export async function resolveSignal(signalId: ID) {
  const { data } = await api.patch(`/ai-signals/${signalId}/resolve`);
  return data;
}

export async function ignoreSignal(signalId: ID) {
  const { data } = await api.patch(`/ai-signals/${signalId}/ignore`);
  return data;
}
