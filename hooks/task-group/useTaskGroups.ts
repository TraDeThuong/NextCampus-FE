"use client";

import { useQuery } from "@tanstack/react-query";
import { taskGroupService } from "@/services/task-group.service";

export function useTaskGroups() {
  return useQuery({
    queryKey: ["task-groups"],
    queryFn: () => taskGroupService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}
