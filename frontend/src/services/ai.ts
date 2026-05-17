import { api } from "@/lib/api";
import type {
  AIAskResponse,
  AIConversation,
  AIConversationContextType,
  AIConversationDetail,
  AIQuestion,
  ID,
} from "@/types";

export interface AskInput {
  question: string;
  user_id?: ID;
  newcomer_id?: ID;
  top_k?: number;
  conversation_id?: ID;
  context_type?: AIConversationContextType;
  context_id?: ID;
}

export async function askAI(input: AskInput): Promise<AIAskResponse> {
  const { data } = await api.post<AIAskResponse>("/ai/ask", input);
  return data;
}

export async function listAIQuestions(): Promise<AIQuestion[]> {
  const { data } = await api.get<AIQuestion[]>("/ai/questions/");
  return data;
}

export async function submitAnswerFeedback(
  questionId: ID,
  feedback: { feedback_type: "thumbs_up" | "thumbs_down" | string; user_id?: ID; newcomer_id?: ID; rating?: number; comment?: string },
) {
  const { data } = await api.post(`/ai/questions/${questionId}/feedback`, feedback);
  return data;
}

export interface ListConversationsParams {
  newcomer_id?: ID;
  user_id?: ID;
  context_type?: AIConversationContextType;
  context_id?: ID;
}

export async function listConversations(params: ListConversationsParams = {}): Promise<AIConversation[]> {
  const { data } = await api.get<AIConversation[]>("/ai/conversations", { params });
  return data;
}

export async function getConversation(id: ID): Promise<AIConversationDetail> {
  const { data } = await api.get<AIConversationDetail>(`/ai/conversations/${id}`);
  return data;
}

export async function createConversation(input: {
  newcomer_id?: ID;
  user_id?: ID;
  title?: string;
  context_type?: AIConversationContextType;
  context_id?: ID;
}): Promise<AIConversation> {
  const { data } = await api.post<AIConversation>("/ai/conversations", input);
  return data;
}

export async function deleteConversation(id: ID): Promise<void> {
  await api.delete(`/ai/conversations/${id}`);
}
