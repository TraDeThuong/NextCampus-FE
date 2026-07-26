"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { UpdateTaskAssignmentPayload } from "@/types/task-assignment";

export function useUpdateTaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTaskAssignmentPayload;
    }) => taskAssignmentService.updateAssignment(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Assignment updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"] }, { exact: false });
      queryClient.invalidateQueries({
        queryKey: ["task-assignment", variables.id],
      });
    },

    onError: () => {
      toast.error("Failed to update assignment.");
    },
  });
}
