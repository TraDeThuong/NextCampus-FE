"use client";

import { useQuery } from "@tanstack/react-query";
import { systemSettingService } from "@/services/system-setting.service";

export function useSystemSettings(enabled = true) {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: () => systemSettingService.getSettings(),
    enabled,
    staleTime: 1000 * 60,
  });
}
