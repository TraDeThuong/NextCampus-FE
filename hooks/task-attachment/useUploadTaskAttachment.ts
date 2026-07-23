"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskAttachmentService } from "@/services/task-attachment.service";

export function useUploadTaskAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      taskAttachmentService.uploadTaskAttachment(taskId, file),

    onSuccess: (_data, variables) => {
      toast.success("Attachment uploaded successfully.");
      queryClient.invalidateQueries({
        queryKey: ["task-attachments", variables.taskId],
      });
    },

    onError: () => {
      toast.error("Failed to upload attachment.");
    },
  });
}
