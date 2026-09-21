"use client";

import { useQuery } from "@tanstack/react-query";
import { cronService } from "@/services/cron.service";

export function useCronJobs(search?: string, enabled = true) {
  return useQuery({
    queryKey: ["cron-jobs", search],
    queryFn: () => cronService.listJobs(search),
    enabled,
    staleTime: 1000 * 30,
  });
}
