"use client";

import { useQuery } from "@tanstack/react-query";
import { dailyReportService } from "@/services/daily-report.service";
import type { DailyReportQueryParams } from "@/types/daily-report";

export function useDailyReports(params?: DailyReportQueryParams) {
  return useQuery({
    queryKey: ["dailyReports", params],
    queryFn: () => dailyReportService.getDailyReports(params),
    staleTime: 1000 * 60 * 5,
  });
}
