"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskAttachmentService } from "@/services/task-attachment.service";

export function useUploadSubmissionAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      file,
    }: {
      submissionId: string;
      file: File;
    }) => taskAttachmentService.uploadSubmissionAttachment(submissionId, file),

    onSuccess: (_data, variables) => {
      toast.success("Attachment uploaded successfully.");
      queryClient.invalidateQueries({
        queryKey: ["submission-attachments", variables.submissionId],
      });
    },

    onError: () => {
      toast.error("Failed to upload attachment.");
    },
  });
}
