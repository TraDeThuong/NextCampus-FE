"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { dailyReportService } from "@/services/daily-report.service";

export function useDeleteDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dailyReportService.deleteDailyReport(id),

    onSuccess: () => {
      toast.success("Daily report deleted.");
      queryClient.invalidateQueries({ queryKey: ["dailyReports"], exact: false });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to delete daily report.";
      toast.error(message);
    },
  });
}
