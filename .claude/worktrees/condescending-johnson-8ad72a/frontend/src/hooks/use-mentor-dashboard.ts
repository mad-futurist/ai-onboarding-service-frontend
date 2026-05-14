"use client";

import { useQuery } from "@tanstack/react-query";

import { getMentorDashboard } from "@/services/dashboards";
import type { ID } from "@/types";

export function useMentorDashboard(mentorId: ID | null) {
  return useQuery({
    queryKey: ["mentor-dashboard", mentorId],
    queryFn: () => getMentorDashboard(mentorId ?? undefined),
    enabled: mentorId !== null,
  });
}
