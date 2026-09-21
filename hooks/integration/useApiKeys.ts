"use client";

import { useQuery } from "@tanstack/react-query";
import { integrationService } from "@/services/integration.service";

export function useApiKeys(enabled = true) {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: () => integrationService.listApiKeys(),
    enabled,
    staleTime: 1000 * 60,
  });
}
