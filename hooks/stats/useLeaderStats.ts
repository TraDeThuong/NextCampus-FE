"use client";

import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/stats.service";

export function useLeaderStats() {
  return useQuery({
    queryKey: ["stats", "leader"],
    queryFn: () => statsService.getLeaderStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
