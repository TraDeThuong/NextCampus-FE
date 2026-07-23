"use client";

import { useQuery } from "@tanstack/react-query";
import { taskAssignmentService } from "@/services/task-assignment.service";

export function useTaskAssignment(id: string | undefined) {
  return useQuery({
    queryKey: ["task-assignment", id],
    queryFn: () => taskAssignmentService.getAssignment(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
