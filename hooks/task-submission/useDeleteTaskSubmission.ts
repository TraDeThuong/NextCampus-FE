"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskSubmissionService } from "@/services/task-submission.service";

export function useDeleteTaskSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskSubmissionService.deleteSubmission(id),

    onSuccess: () => {
      toast.success("Submission deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-submissions"] });
    },

    onError: () => {
      toast.error("Failed to delete submission.");
    },
  });
}
