"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
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

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to upload attachment.";
      toast.error(message);
    },
  });
}
