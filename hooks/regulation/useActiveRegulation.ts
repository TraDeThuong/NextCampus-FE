"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveRegulationService } from "@/services/regulation.service";

export function useActiveRegulation() {
  return useQuery({
    queryKey: ["regulations", "active"],
    queryFn: () => getActiveRegulationService(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
