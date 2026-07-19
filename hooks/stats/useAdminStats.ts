"use client";

import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/stats.service";

export function useAdminStats() {
  return useQuery({
    queryKey: ["stats", "admin"],
    queryFn: () => statsService.getAdminStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
