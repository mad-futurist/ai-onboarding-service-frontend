"use client";

import { useQuery } from "@tanstack/react-query";

import { getArenaDebrief } from "@/services/arena";
import type { ID } from "@/types";

export function useArenaDebrief(sessionId: ID | null) {
  return useQuery({
    queryKey: ["arena", "debrief", sessionId],
    queryFn: () => getArenaDebrief(sessionId!),
    enabled: sessionId !== null,
    retry: 1,
  });
}
