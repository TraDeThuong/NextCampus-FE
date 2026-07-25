"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskService } from "@/services/task.service";
import type { UpdateTaskPayload } from "@/types/task";

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      taskService.updateTask(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Task updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
    },

    onError: () => {
      toast.error("Failed to update task.");
    },
  });
}
