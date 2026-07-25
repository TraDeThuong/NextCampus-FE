"use client";

import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/task.service";

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => taskService.getTask(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
