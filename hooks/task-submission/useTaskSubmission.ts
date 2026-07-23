"use client";

import { useQuery } from "@tanstack/react-query";
import { taskSubmissionService } from "@/services/task-submission.service";

export function useTaskSubmission(id: string | undefined) {
  return useQuery({
    queryKey: ["task-submission", id],
    queryFn: () => taskSubmissionService.getSubmission(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
