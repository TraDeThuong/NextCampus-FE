"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { CreateTaskAssignmentPayload } from "@/types/task-assignment";

export function useCreateTaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskAssignmentPayload) =>
      taskAssignmentService.createAssignment(payload),

    onSuccess: () => {
      toast.success("Assignment created successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
    },

    onError: () => {
      toast.error("Failed to create assignment.");
    },
  });
}
