"use client";

import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/task.service";
import type { TaskQueryParams } from "@/types/task";

export function useTasks(params?: TaskQueryParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => taskService.getTasks(params),
    staleTime: 1000 * 60 * 5,
  });
}
