"use client";

import { useQuery } from "@tanstack/react-query";
import { maintenanceService } from "@/services/maintenance.service";

export function useMaintenanceConfig(enabled = true) {
  return useQuery({
    queryKey: ["maintenance-status"],
    queryFn: () => maintenanceService.getStatus(),
    enabled,
    staleTime: 1000 * 30, // 30s
    refetchInterval: 1000 * 60, // Poll every minute
  });
}
