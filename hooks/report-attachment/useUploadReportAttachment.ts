"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { reportAttachmentService } from "@/services/report-attachment.service";

export function useUploadReportAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, file }: { reportId: string; file: File }) =>
      reportAttachmentService.uploadReportAttachment(reportId, file),

    onSuccess: (_data, variables) => {
      toast.success("Attachment uploaded successfully.");
      queryClient.invalidateQueries({
        queryKey: ["reportAttachments", variables.reportId],
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
