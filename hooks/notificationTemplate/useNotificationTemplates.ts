"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationTemplateService } from "@/services/notificationTemplate.service";

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ["notification-templates"],
    queryFn: () => notificationTemplateService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}
