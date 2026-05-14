import { api } from "@/lib/api";
import type { AIAskResponse, AIQuestion, ID } from "@/types";

export interface AskInput {
  question: string;
  user_id?: ID;
  newcomer_id?: ID;
  top_k?: number;
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
