"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAttachmentService } from "@/services/task-attachment.service";

export function useUploadTaskAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      // 1. Xin Presigned PUT URL từ server
      const { data: presigned } =
        await taskAttachmentService.getTaskAttachmentPutUrl(
          taskId,
          file.name,
          file.type,
          file.size,
        );

      // 2. Upload thẳng lên Cloudflare R2
      await axios.put(presigned.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        withCredentials: false,
      });

      // 3. Xác nhận tải lên thành công để lưu CSDL
      return taskAttachmentService.confirmTaskAttachmentUpload(
        taskId,
        presigned.filePath,
        file.name,
        file.type,
        file.size,
      );
    },

    onSuccess: (_data, variables) => {
      toast.success("Attachment uploaded successfully.");
      queryClient.invalidateQueries({
        queryKey: ["task-attachments", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
          ? error.response.data.message
          : "Failed to upload attachment.";
      toast.error(message);
    },
  });
}
