"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { CreateTaskAssignmentPayload } from "@/types/task-assignment";

export function useCreateTaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskAssignmentPayload) =>
      taskAssignmentService.createAssignment(payload),

    onSuccess: () => {
      toast.success("Assignment created successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["tasks"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"] }, { exact: false });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to create assignment.";
      toast.error(message);
    },
  });
}
