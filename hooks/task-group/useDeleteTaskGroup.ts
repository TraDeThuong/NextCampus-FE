"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskGroupService } from "@/services/task-group.service";

export function useDeleteTaskGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskGroupService.delete(id),

    onSuccess: () => {
      toast.success("Task group deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-groups"] });
    },

    onError: () => {
      toast.error("Failed to delete task group.");
    },
  });
}
