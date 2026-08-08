"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { reportAttachmentService } from "@/services/report-attachment.service";

export function useUploadReportAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, file }: { reportId: string; file: File }) => {
      // 1. Xin Presigned PUT URL từ server
      const { data: presigned } =
        await reportAttachmentService.getReportAttachmentPutUrl(
          reportId,
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
      return reportAttachmentService.confirmReportAttachmentUpload(
        reportId,
        presigned.filePath,
        file.name,
        file.type,
        file.size,
      );
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reportAttachments", variables.reportId],
      });
      // Cũng cập nhật lại dailyReport chi tiết để thấy list attachments mới
      queryClient.invalidateQueries({
        queryKey: ["dailyReport", variables.reportId],
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
