"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskSubmissionService } from "@/services/task-submission.service";

export function useUploadSubmissionVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      taskSubmissionService.uploadVideo(id, file),

    onSuccess: (_data, variables) => {
      toast.success("Video uploaded successfully.");
      queryClient.invalidateQueries({ queryKey: ["task-submission", variables.id] });
    },

    onError: () => {
      toast.error("Failed to upload video.");
    },
  });
}
