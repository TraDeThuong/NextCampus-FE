"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskAttachmentService } from "@/services/task-attachment.service";

export function useDeleteTaskAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      attachmentId,
    }: {
      taskId: string;
      attachmentId: string;
    }) => taskAttachmentService.deleteTaskAttachment(taskId, attachmentId),

    onSuccess: (_data, variables) => {
      toast.success("Attachment deleted successfully.");
      queryClient.invalidateQueries({
        queryKey: ["task-attachments", variables.taskId],
      });
    },

    onError: () => {
      toast.error("Failed to delete attachment.");
    },
  });
}
