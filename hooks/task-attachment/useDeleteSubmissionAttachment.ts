"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAttachmentService } from "@/services/task-attachment.service";
import type { SubmissionAttachmentListResponse } from "@/types/task-attachment";

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
      queryClient.setQueryData<SubmissionAttachmentListResponse>(
        ["submission-attachments", variables.submissionId],
        (current) => current
          ? {
              ...current,
              data: current.data.filter(
                (item) => item.id !== variables.attachmentId,
              ),
            }
          : current,
      );
      queryClient.invalidateQueries({
        queryKey: ["submission-attachments", variables.submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["task-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["task-submission", variables.submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["task-submission-thread"] });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
          ? error.response.data.message
          : "Failed to delete attachment.";
      toast.error(message);
    },
  });
}
