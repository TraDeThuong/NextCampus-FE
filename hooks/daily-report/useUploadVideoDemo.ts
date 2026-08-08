"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { dailyReportService } from "@/services/daily-report.service";

export function useUploadVideoDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      // 1. Xin Presigned PUT URL từ server
      const { data: presigned } = await dailyReportService.getVideoPutUrl(
        id,
        file.type,
      );

      // 2. Upload thẳng lên Cloudflare R2
      await axios.put(presigned.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        withCredentials: false,
      });

      // 3. Xác nhận tải lên thành công để lưu CSDL
      return dailyReportService.confirmVideoUpload(id, presigned.filePath);
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dailyReport", variables.id],
      });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
          ? error.response.data.message
          : "Failed to upload video demo.";
      toast.error(message);
    },
  });
}
