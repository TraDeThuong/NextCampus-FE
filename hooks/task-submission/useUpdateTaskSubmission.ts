"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskSubmissionService } from "@/services/task-submission.service";
import type { UpdateTaskSubmissionPayload } from "@/types/task-submission";

export function useUpdateTaskSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTaskSubmissionPayload;
    }) => taskSubmissionService.updateSubmission(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Submission updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["task-submission", variables.id] });
    },

    onError: () => {
      toast.error("Failed to update submission.");
    },
  });
}
