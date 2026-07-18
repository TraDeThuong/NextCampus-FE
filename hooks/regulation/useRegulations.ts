"use client";

import { useQuery } from "@tanstack/react-query";
import { regulationService } from "@/services/regulation.service";

import type { RegulationQueryParams } from "@/types/regulation";

export function useRegulations(params?: RegulationQueryParams) {
  return useQuery({
    queryKey: ["regulations", params],
    queryFn: () => regulationService.getRegulations(params),
    staleTime: 1000 * 60 * 2,
  });
}
