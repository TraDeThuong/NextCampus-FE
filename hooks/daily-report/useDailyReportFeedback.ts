"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dailyReportService } from "@/services/daily-report.service";
import { toast } from "react-hot-toast";

interface AddFeedbackPayload {
  id: string;
  feedback: string;
}

export function useDailyReportFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, feedback }: AddFeedbackPayload) =>
      dailyReportService.addFeedback(id, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dailyReports"] });
      queryClient.invalidateQueries({ queryKey: ["dailyReport"] });
      queryClient.invalidateQueries({ queryKey: ["dailyReportCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report", variables.id] });
      toast.success("Đã gửi phản hồi báo cáo thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể gửi phản hồi báo cáo");
    },
  });
}
