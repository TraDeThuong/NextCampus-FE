"use client";

import { useQuery } from "@tanstack/react-query";
import { taskAssignmentService } from "@/services/task-assignment.service";

export function useTaskAssignmentExtensionRequests(
  assignmentId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["task-assignment-extension-requests", assignmentId],
    queryFn: () => {
      if (!assignmentId) throw new Error("assignmentId is required");
      return taskAssignmentService.getExtensionRequestsByAssignment(assignmentId);
    },
    staleTime: 1000 * 60 * 3,
    enabled: enabled && !!assignmentId,
  });
}
