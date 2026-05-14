"use client";

import { useQuery } from "@tanstack/react-query";

import { getNewcomerDashboard } from "@/services/dashboards";
import type { ID } from "@/types";

export function useNewcomerDashboard(newcomerId: ID | null) {
  return useQuery({
    queryKey: ["newcomer-dashboard", newcomerId],
    queryFn: () => getNewcomerDashboard(newcomerId!),
    enabled: newcomerId !== null,
  });
}
