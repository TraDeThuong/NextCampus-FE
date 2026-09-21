"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationSettingService } from "@/services/notification-setting.service";
import { useRBAC } from "@/hooks/rbac/useRBAC";

export function useNotificationSettings() {
  const { can } = useRBAC();
  const canRead = can("NOTIFICATION_SETTING_READ");

  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: () => notificationSettingService.getSettings(),
    enabled: canRead,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
