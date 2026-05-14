import { api } from "@/lib/api";
import type { ID } from "@/types";

export interface DraftMessageInput {
  newcomer_id: ID;
  signal_id?: ID;
  blocked_report_id?: ID;
  tone?: "supportive" | "direct" | "casual";
}

export interface DraftMessageResponse {
  message: string;
  newcomer_name: string;
  signal_title: string | null;
}

export async function draftMentorMessage(input: DraftMessageInput): Promise<DraftMessageResponse> {
  const { data } = await api.post<DraftMessageResponse>("/mentor-actions/draft-message", input);
  return data;
}
