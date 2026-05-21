"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getArenaLeaderboard,
  getNewcomerArenaSummary,
  listArenaScenarios,
} from "@/services/arena";
import type { ID } from "@/types";

export function useArenaLobby(newcomerId: ID | null) {
  const scenariosQuery = useQuery({
    queryKey: ["arena", "scenarios", newcomerId],
    queryFn: () => listArenaScenarios({ newcomer_id: newcomerId ?? undefined }),
    enabled: newcomerId !== null,
  });

  const summaryQuery = useQuery({
    queryKey: ["arena", "newcomer-summary", newcomerId],
    queryFn: () => getNewcomerArenaSummary(newcomerId!),
    enabled: newcomerId !== null,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["arena", "leaderboard"],
    queryFn: () => getArenaLeaderboard({ limit: 5 }),
  });

  return {
    scenarios: scenariosQuery.data ?? [],
    summary: summaryQuery.data,
    leaderboard: leaderboardQuery.data ?? [],
    isLoading:
      scenariosQuery.isLoading || summaryQuery.isLoading || leaderboardQuery.isLoading,
    refetch: () => {
      scenariosQuery.refetch();
      summaryQuery.refetch();
      leaderboardQuery.refetch();
    },
  };
}
