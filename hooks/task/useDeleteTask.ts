"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskService } from "@/services/task.service";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),

    onSuccess: () => {
      toast.success("Task deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },

    onError: () => {
      toast.error("Failed to delete task.");
    },
  });
}
