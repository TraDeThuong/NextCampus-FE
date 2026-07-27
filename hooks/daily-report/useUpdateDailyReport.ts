"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { dailyReportService } from "@/services/daily-report.service";
import type { UpdateDailyReportPayload } from "@/types/daily-report";

export function useUpdateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDailyReportPayload;
    }) => dailyReportService.updateDailyReport(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Daily report updated.");
      queryClient.invalidateQueries({ queryKey: ["dailyReports"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["dailyReport", variables.id] });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to update daily report.";
      toast.error(message);
    },
  });
}
