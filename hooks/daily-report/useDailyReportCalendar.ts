"use client";

import { useQuery } from "@tanstack/react-query";
import { dailyReportService } from "@/services/daily-report.service";

interface CalendarQueryParams {
  month: number;
  year: number;
  internId?: string;
}

export function useDailyReportCalendar(params: CalendarQueryParams, enabled = true) {
  return useQuery({
    queryKey: ["daily-reports", "calendar", params],
    queryFn: () => dailyReportService.getCalendar(params),
    enabled: enabled && !!params.month && !!params.year,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
