"use client";

import { useQuery } from "@tanstack/react-query";
import { taskSubmissionService } from "@/services/task-submission.service";

export function useTaskSubmissionThread(assignmentId?: string) {
  return useQuery({
    queryKey: ["task-submission-thread", assignmentId],
    queryFn: () =>
      taskSubmissionService.getSubmissionThread(assignmentId as string),
    enabled: Boolean(assignmentId),
  });
}
