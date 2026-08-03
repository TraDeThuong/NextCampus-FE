"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskGroupService } from "@/services/task-group.service";
import type { UpdateTaskGroupPayload } from "@/types/task-group";
import axios from "axios";

export function useUpdateTaskGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTaskGroupPayload;
    }) => taskGroupService.update(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Task group updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-groups"] });
      queryClient.invalidateQueries({ queryKey: ["task-group", variables.id] });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to update task group.";
      toast.error(message);
    },
  });
}
