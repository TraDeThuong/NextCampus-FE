"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { dailyReportService } from "@/services/daily-report.service";
import type { CreateDailyReportPayload } from "@/types/daily-report";

export function useCreateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDailyReportPayload) =>
      dailyReportService.createDailyReport(payload),

    onSuccess: () => {
      toast.success("Daily report submitted successfully.");
      queryClient.invalidateQueries({ queryKey: ["dailyReports"] }, { exact: false });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to submit daily report.";
      toast.error(message);
    },
  });
}
