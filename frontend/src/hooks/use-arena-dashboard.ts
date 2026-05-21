"use client";

import { useQuery } from "@tanstack/react-query";

import { getMentorArenaDashboard } from "@/services/arena";
import type { ID } from "@/types";

export function useArenaDashboard(mentorId: ID | null) {
  return useQuery({
    queryKey: ["arena", "mentor-dashboard", mentorId],
    queryFn: () => getMentorArenaDashboard(mentorId!),
    enabled: mentorId !== null,
  });
}
