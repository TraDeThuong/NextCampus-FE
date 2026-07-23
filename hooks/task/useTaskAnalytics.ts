"use client";

import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/task.service";

export function useTaskAnalytics(
  taskGroupId?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery({
    queryKey: ["task-analytics", taskGroupId, dateFrom, dateTo],
    queryFn: () => taskService.getAnalytics(taskGroupId, dateFrom, dateTo),
    staleTime: 1000 * 60 * 5,
  });
}
