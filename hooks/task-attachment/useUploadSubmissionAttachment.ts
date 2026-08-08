"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAttachmentService } from "@/services/task-attachment.service";
import type { SubmissionAttachmentListResponse } from "@/types/task-attachment";

export function useUploadSubmissionAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      file,
    }: {
      submissionId: string;
      file: File;
    }) => {
      // 1. Xin Presigned PUT URL từ server
      const { data: presigned } =
        await taskAttachmentService.getSubmissionAttachmentPutUrl(
          submissionId,
          file.name,
          file.type,
          file.size,
        );

      // 2. Upload thẳng lên Cloudflare R2 (không qua server VPS)
      await axios.put(presigned.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        // Không dùng axios instance của app (tránh đính kèm Authorization header vào R2)
        withCredentials: false,
      });

      // 3. Báo server lưu metadata vào database
      return taskAttachmentService.confirmSubmissionAttachmentUpload(
        submissionId,
        presigned.filePath,
        file.name,
        file.type,
        file.size,
      );
    },

    onSuccess: (data, variables) => {
      queryClient.setQueryData<SubmissionAttachmentListResponse>(
        ["submission-attachments", variables.submissionId],
        (current) => ({
          success: true,
          data: current?.data.some((item) => item.id === data.data.id)
            ? current.data
            : [data.data, ...(current?.data ?? [])],
        }),
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
          : "Failed to upload attachment.";
      toast.error(message);
    },
  });
}
