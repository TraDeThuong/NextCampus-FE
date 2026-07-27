"use client";

import { useQuery } from "@tanstack/react-query";
import { dailyReportService } from "@/services/daily-report.service";

export function useDailyReport(id: string | undefined) {
  return useQuery({
    queryKey: ["dailyReport", id],
    queryFn: () => dailyReportService.getDailyReport(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
