"use client";

import { useQuery } from "@tanstack/react-query";
import { taskGroupService } from "@/services/task-group.service";

export function useTaskGroupProgress(groupId: string, enabled = true) {
  return useQuery({
    queryKey: ["task-group-progress", groupId],
    queryFn: () => taskGroupService.getProgress(groupId),
    enabled: !!groupId && enabled,
    staleTime: 1000 * 30,
  });
}
