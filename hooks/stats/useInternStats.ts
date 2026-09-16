"use client";

import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/stats.service";

export function useInternStats(internId?: string) {
  return useQuery({
    queryKey: ["stats", "intern", internId ?? "me"],
    queryFn: () => statsService.getInternStats(internId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
