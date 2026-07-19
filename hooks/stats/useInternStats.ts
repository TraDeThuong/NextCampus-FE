"use client";

import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/stats.service";

export function useInternStats() {
  return useQuery({
    queryKey: ["stats", "intern"],
    queryFn: () => statsService.getInternStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
