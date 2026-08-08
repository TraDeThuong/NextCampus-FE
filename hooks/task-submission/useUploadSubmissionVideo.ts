"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskSubmissionService } from "@/services/task-submission.service";

export function useUploadSubmissionVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      taskSubmissionService.uploadVideo(id, file),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["task-submission", variables.id] });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
          ? error.response.data.message
          : "Failed to upload video.";
      toast.error(message);
    },
  });
}
