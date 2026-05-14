import { api } from "@/lib/api";
import type {
  MentorDashboardResponse,
  MentorNewcomerDetail,
  NewcomerDashboardResponse,
  ID,
} from "@/types";

export async function getMentorDashboard(mentorId?: ID): Promise<MentorDashboardResponse> {
  const { data } = await api.get<MentorDashboardResponse>("/mentor-dashboard/", {
    params: mentorId ? { mentor_id: mentorId } : undefined,
  });
  return data;
}

export async function getMentorNewcomerDetail(newcomerId: ID): Promise<MentorNewcomerDetail> {
  const { data } = await api.get<MentorNewcomerDetail>(`/mentor-dashboard/newcomers/${newcomerId}`);
  return data;
}

export async function getNewcomerDashboard(newcomerId: ID): Promise<NewcomerDashboardResponse> {
  const { data } = await api.get<NewcomerDashboardResponse>(`/newcomer-dashboard/${newcomerId}`);
  return data;
}
