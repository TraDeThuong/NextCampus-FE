"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { dailyReportService } from "@/services/daily-report.service";

export function useUploadVideoDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      dailyReportService.uploadVideoDemo(id, file),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dailyReport", variables.id],
      });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to upload video demo.";
      toast.error(message);
    },
  });
}
