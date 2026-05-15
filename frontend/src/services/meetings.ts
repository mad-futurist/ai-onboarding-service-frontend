import { api } from "@/lib/api";
import type { ID, ScheduledMeeting } from "@/types";

export interface ListMeetingsParams {
  newcomer_id?: ID;
  organizer_user_id?: ID;
  plan_id?: ID;
  task_id?: ID;
  signal_id?: ID;
  starts_from?: string;
  starts_to?: string;
}

export async function listMeetings(params?: ListMeetingsParams): Promise<ScheduledMeeting[]> {
  const { data } = await api.get<ScheduledMeeting[]>("/meetings", { params });
  return data;
}

export async function getMeeting(id: ID): Promise<ScheduledMeeting> {
  const { data } = await api.get<ScheduledMeeting>(`/meetings/${id}`);
  return data;
}

export interface CreateMeetingInput {
  title: string;
  agenda?: string | null;
  starts_at: string;
  ends_at: string;
  newcomer_id?: ID | null;
  organizer_user_id?: ID | null;
  plan_id?: ID | null;
  task_id?: ID | null;
  signal_id?: ID | null;
  teams_join_url?: string | null;
  attendee_emails?: string[] | null;
  status?: string;
}

export async function createMeeting(input: CreateMeetingInput): Promise<ScheduledMeeting> {
  const { data } = await api.post<ScheduledMeeting>("/meetings", input);
  return data;
}

export interface UpdateMeetingInput {
  title?: string;
  agenda?: string | null;
  starts_at?: string;
  ends_at?: string;
  teams_join_url?: string | null;
  attendee_emails?: string[] | null;
  status?: string;
}

export async function updateMeeting(id: ID, input: UpdateMeetingInput): Promise<ScheduledMeeting> {
  const { data } = await api.patch<ScheduledMeeting>(`/meetings/${id}`, input);
  return data;
}

export async function deleteMeeting(id: ID): Promise<void> {
  await api.delete(`/meetings/${id}`);
}
