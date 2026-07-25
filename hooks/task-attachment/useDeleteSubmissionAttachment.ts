"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskAttachmentService } from "@/services/task-attachment.service";

export function useDeleteSubmissionAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      attachmentId,
    }: {
      submissionId: string;
      attachmentId: string;
    }) =>
      taskAttachmentService.deleteSubmissionAttachment(submissionId, attachmentId),

    onSuccess: (_data, variables) => {
      toast.success("Attachment deleted successfully.");
      queryClient.invalidateQueries({
        queryKey: ["submission-attachments", variables.submissionId],
      });
    },

    onError: () => {
      toast.error("Failed to delete attachment.");
    },
  });
}
