import { api } from "@/lib/api";
import type {
  AISignal,
  AISignalDetectionResponse,
  ID,
  SignalAudience,
  SignalComment,
  SignalCommentVisibility,
} from "@/types";

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

export async function listSignalsForMe(
  newcomerId: ID,
  status?: string,
): Promise<AISignal[]> {
  const { data } = await api.get<AISignal[]>("/ai-signals/me", {
    params: { newcomer_id: newcomerId, ...(status ? { status } : {}) },
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

export async function acknowledgeSignal(signalId: ID): Promise<AISignal> {
  const { data } = await api.patch<AISignal>(`/ai-signals/${signalId}/acknowledge`);
  return data;
}

export async function listSignalComments(
  signalId: ID,
  as: SignalAudience,
  userId?: ID | null,
): Promise<SignalComment[]> {
  const { data } = await api.get<SignalComment[]>(`/ai-signals/${signalId}/comments`, {
    params: { as, ...(userId != null ? { user_id: userId } : {}) },
  });
  return data;
}

export async function postSignalComment(
  signalId: ID,
  body: {
    comment: string;
    visibility: SignalCommentVisibility;
    author_role: SignalAudience;
    user_id?: ID | null;
  },
): Promise<SignalComment> {
  const { data } = await api.post<SignalComment>(`/ai-signals/${signalId}/comments`, {
    feedback_type: "comment",
    comment: body.comment,
    visibility: body.visibility,
    author_role: body.author_role,
    user_id: body.user_id ?? null,
  });
  return data;
}

export async function reactToSignalNote(
  signalId: ID,
  body: {
    reaction: "approve" | "discuss";
    author_role: SignalAudience;
    user_id?: ID | null;
  },
): Promise<SignalComment> {
  const { data } = await api.post<SignalComment>(`/ai-signals/${signalId}/comments`, {
    feedback_type: body.reaction,
    comment: null,
    visibility: "shared",
    author_role: body.author_role,
    user_id: body.user_id ?? null,
  });
  return data;
}

export async function requestPlanAdjustment(
  signalId: ID,
  message?: string,
  userId?: ID | null,
): Promise<SignalComment> {
  const { data } = await api.post<SignalComment>(
    `/ai-signals/${signalId}/request-plan-adjustment`,
    {
      feedback_type: "adjust_request",
      comment: message ?? null,
      visibility: "shared",
      author_role: "newcomer",
      user_id: userId ?? null,
    },
  );
  return data;
}
