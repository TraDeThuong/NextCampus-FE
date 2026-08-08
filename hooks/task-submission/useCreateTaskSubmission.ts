"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskSubmissionService } from "@/services/task-submission.service";
import type { CreateTaskSubmissionPayload } from "@/types/task-submission";

export function useCreateTaskSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskSubmissionPayload) =>
      taskSubmissionService.createSubmission(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
    },

    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? "Failed to create submission."
        : "Failed to create submission.";
      toast.error(message);
    },
  });
}
