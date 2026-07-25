"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskService } from "@/services/task.service";
import type { CreateTaskPayload } from "@/types/task";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),

    onSuccess: () => {
      toast.success("Task created successfully.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] }, { exact: false });
    },

    onError: () => {
      toast.error("Failed to create task.");
    },
  });
}
