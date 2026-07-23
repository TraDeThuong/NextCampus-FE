"use client";

import { useQuery } from "@tanstack/react-query";
import { taskGroupService } from "@/services/task-group.service";

export function useTaskGroup(id: string | undefined) {
  return useQuery({
    queryKey: ["task-group", id],
    queryFn: () => taskGroupService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
