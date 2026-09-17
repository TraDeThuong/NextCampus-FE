"use client";

import { useQuery } from "@tanstack/react-query";
import { taskGroupService } from "@/services/task-group.service";
import type { TaskGroupQueryParams } from "@/types/task-group";

export function useTaskGroups(params?: TaskGroupQueryParams) {
  return useQuery({
    queryKey: ["task-groups", params],
    queryFn: () => taskGroupService.getAll(params),
    staleTime: 1000 * 60 * 2,
  });
}
