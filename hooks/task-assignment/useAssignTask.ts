"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { AssignTaskPayload } from "@/types/task-assignment";

export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: AssignTaskPayload;
    }) => taskAssignmentService.assignTask(taskId, payload),

    onSuccess: () => {
      toast.success("Assignment updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to update assignment.";
      toast.error(message);
    },
  });
}
