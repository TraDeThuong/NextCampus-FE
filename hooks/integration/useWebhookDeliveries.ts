"use client";

import { useQuery } from "@tanstack/react-query";
import { integrationService } from "@/services/integration.service";
import type { WebhookDeliveriesQuery } from "@/types/integration";

export function useWebhookDeliveries(
  webhookId: string | null,
  query?: WebhookDeliveriesQuery,
  enabled = true
) {
  return useQuery({
    queryKey: ["webhook-deliveries", webhookId, query],
    queryFn: () => {
      if (!webhookId) throw new Error("Webhook ID is required");
      return integrationService.listDeliveries(webhookId, query);
    },
    enabled: Boolean(webhookId) && enabled,
    staleTime: 1000 * 15,
  });
}
