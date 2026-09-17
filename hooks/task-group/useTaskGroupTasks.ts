"use client";

import { useQuery } from "@tanstack/react-query";
import { taskGroupService } from "@/services/task-group.service";

export function useTaskGroupTasks(groupId: string, enabled = true) {
  return useQuery({
    queryKey: ["task-group-tasks", groupId],
    queryFn: () => taskGroupService.getTasks(groupId),
    enabled: !!groupId && enabled,
    staleTime: 1000 * 30,
  });
}
