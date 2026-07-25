"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskSubmissionService } from "@/services/task-submission.service";
import type { CreateTaskSubmissionPayload } from "@/types/task-submission";

export function useCreateTaskSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskSubmissionPayload) =>
      taskSubmissionService.createSubmission(payload),

    onSuccess: () => {
      toast.success("Submission created successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-submissions"] });
    },

    onError: () => {
      toast.error("Failed to create submission.");
    },
  });
}
