"use client";

import { useQuery } from "@tanstack/react-query";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { TaskExtensionRequestQueryParams } from "@/types/task-assignment";

export function useTaskExtensionRequests(
  params?: TaskExtensionRequestQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["extension-requests", params],
    queryFn: () => taskAssignmentService.getExtensionRequests(params),
    staleTime: 1000 * 60 * 3,
    enabled,
  });
}
