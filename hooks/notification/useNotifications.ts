"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import type { NotificationQueryParams } from "@/types/notification";

export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 1000 * 60 * 1,
  });
}
