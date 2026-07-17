"use client";

import { useQuery } from "@tanstack/react-query";
import { regulationService } from "@/services/regulation.service";

export function useRegulations() {
  return useQuery({
    queryKey: ["regulations"],
    queryFn: () => regulationService.getRegulations(),
    staleTime: 1000 * 60 * 2,
  });
}
