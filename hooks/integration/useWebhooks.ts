"use client";

import { useQuery } from "@tanstack/react-query";
import { integrationService } from "@/services/integration.service";

export function useWebhooks(enabled = true) {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: () => integrationService.listWebhooks(),
    enabled,
    staleTime: 1000 * 60,
  });
}
