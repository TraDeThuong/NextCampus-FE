"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskGroupService } from "@/services/task-group.service";
import type { CreateTaskGroupPayload } from "@/types/task-group";

export function useCreateTaskGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskGroupPayload) =>
      taskGroupService.create(payload),

    onSuccess: () => {
      toast.success("Task group created successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-groups"] });
    },

    onError: () => {
      toast.error("Failed to create task group.");
    },
  });
}
