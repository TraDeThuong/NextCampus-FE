"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskAssignmentService } from "@/services/task-assignment.service";

export function useDeleteTaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskAssignmentService.deleteAssignment(id),

    onSuccess: () => {
      toast.success("Assignment deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"] }, { exact: false });
    },

    onError: () => {
      toast.error("Failed to delete assignment.");
    },
  });
}
