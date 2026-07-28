"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { reportAttachmentService } from "@/services/report-attachment.service";

export function useDeleteReportAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      attachmentId,
    }: {
      reportId: string;
      attachmentId: string;
    }) =>
      reportAttachmentService.deleteReportAttachment(reportId, attachmentId),

    onSuccess: (_data, variables) => {
      toast.success("Attachment deleted.");
      queryClient.invalidateQueries({
        queryKey: ["reportAttachments", variables.reportId],
      });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to delete attachment.";
      toast.error(message);
    },
  });
}
