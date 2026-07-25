"use client";

import { useQuery } from "@tanstack/react-query";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { TaskAssignmentQueryParams } from "@/types/task-assignment";

export function useTaskAssignments(params?: TaskAssignmentQueryParams) {
  return useQuery({
    queryKey: ["task-assignments", params],
    queryFn: () => taskAssignmentService.getAssignments(params),
    staleTime: 1000 * 60 * 5,
  });
}
