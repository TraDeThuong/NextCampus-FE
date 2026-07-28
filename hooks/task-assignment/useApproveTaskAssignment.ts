"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskAssignmentService } from "@/services/task-assignment.service";

export function useApproveTaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskAssignmentService.approveAssignment(id),

    onSuccess: (_data, id) => {
      toast.success("Assignment approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task-assignment", id] });
    },

    onError: () => {
      toast.error("Failed to approve assignment.");
    },
  });
}
