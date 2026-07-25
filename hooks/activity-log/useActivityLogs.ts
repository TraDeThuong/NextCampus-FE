"use client";

import { useQuery } from "@tanstack/react-query";
import { activityLogService } from "@/services/activity-log.service";
import type { ActivityLogQuery } from "@/types/activity-log";

export function useActivityLogs(params?: ActivityLogQuery) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => activityLogService.getActivityLogs(params),
    staleTime: 1000 * 30, // 30 seconds stale time
  });
}
