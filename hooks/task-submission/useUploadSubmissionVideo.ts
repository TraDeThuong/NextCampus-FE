"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskSubmissionService } from "@/services/task-submission.service";

export function useUploadSubmissionVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      // 1. Xin Presigned PUT URL từ server
      const { data: presigned } = await taskSubmissionService.getVideoPutUrl(
        id,
        file.type,
      );

      // 2. Upload thẳng lên Cloudflare R2 (không qua server VPS)
      await axios.put(presigned.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        // Không dùng axios instance của app (tránh đính kèm Authorization header vào R2)
        withCredentials: false,
      });

      // 3. Báo server lưu metadata vào database
      return taskSubmissionService.confirmVideoUpload(id, presigned.filePath);
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["task-submission", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["task-submission-thread"] });
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
