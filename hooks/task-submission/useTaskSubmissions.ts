"use client";

import { useQuery } from "@tanstack/react-query";
import { taskSubmissionService } from "@/services/task-submission.service";
import type { TaskSubmissionQueryParams } from "@/types/task-submission";

export function useTaskSubmissions(
  params?: TaskSubmissionQueryParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["task-submissions", params],
    queryFn: () => taskSubmissionService.getSubmissions(params),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
