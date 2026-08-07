// hooks/useInternPrefetchQueries.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { statsService } from "@/services/stats.service";
import { taskAssignmentService } from "@/services/task-assignment.service";
import { departmentService } from "@/services/department.service";
import { meetingService } from "@/services/meeting.service";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import { authService } from "@/services/auth.service";
import { internService } from "@/services/intern.service";

type PrefetchBatch = {
  queryKey: unknown[];
  queryFn: () => Promise<unknown>;
  staleTime?: number;
};

const PAGE_PREFETCH_MAP: Record<string, PrefetchBatch[]> = {
  dashboard: [
    { queryKey: ["stats", "intern"], queryFn: () => statsService.getInternStats(), staleTime: 1000 * 60 * 5 },
  ],
  profile: [
    { queryKey: ["profile"], queryFn: () => authService.me(), staleTime: 1000 * 60 * 5 },
    { queryKey: ["my-intern"], queryFn: () => internService.getMyIntern(), staleTime: 1000 * 60 * 5 },
  ],
  task: [
    { queryKey: ["task-assignments", { limit: 100 }], queryFn: () => taskAssignmentService.getAssignments({ limit: 100 }), staleTime: 1000 * 60 * 2 },
  ],
  meetings: [
    { queryKey: ["meetings", undefined], queryFn: () => meetingService.getMeetings(), staleTime: 1000 * 60 * 5 },
    { queryKey: ["meetings", { limit: 1 }], queryFn: () => meetingService.getMeetings({ limit: 1 }) },
    { queryKey: ["meetings", { status: "SCHEDULED" as const, limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "SCHEDULED", limit: 1 }) },
    { queryKey: ["meetings", { status: "ONGOING" as const, limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "ONGOING", limit: 1 }) },
    { queryKey: ["meetings", { status: "COMPLETED" as const, limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "COMPLETED", limit: 1 }) },
    { queryKey: ["meetings", { status: "CANCELLED" as const, limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "CANCELLED", limit: 1 }) },
  ],
  "weekly-evaluation": [
    { queryKey: ["weeklyEvaluations", { page: 1, limit: 10, sortBy: "week" as const, order: "desc" as const }], queryFn: () => weeklyEvaluationService.getWeeklyEvaluations({ page: 1, limit: 10, sortBy: "week", order: "desc" }), staleTime: 1000 * 60 * 5 },
  ],
  "daily-report": [
    { queryKey: ["my-intern"], queryFn: () => internService.getMyIntern(), staleTime: 1000 * 60 * 5 },
  ],
  // Also fix department (was prefetched with wrong key)
  department: [
    { queryKey: ["departments", undefined], queryFn: () => departmentService.getDepartments(), staleTime: 1000 * 60 * 10 },
  ],
};

const STAGGERED_BATCHES: string[][] = [
  ["dashboard", "profile", "task"],
  ["meetings", "daily-report"],
  ["weekly-evaluation"],
];

const STAGGER_DELAYS_MS = [300, 600, 900];

export function useInternPrefetchQueries() {
  const queryClient = useQueryClient();

  const prefetchPage = useCallback(
    (pageKey: string) => {
      const batches = PAGE_PREFETCH_MAP[pageKey];
      if (!batches) return;
      for (const batch of batches) {
        queryClient.prefetchQuery({
          queryKey: batch.queryKey,
          queryFn: batch.queryFn,
          staleTime: batch.staleTime ?? 1000 * 60 * 5,
        }).catch(() => {});
      }
    },
    [queryClient],
  );

  const prefetchAllStaggered = useCallback(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    STAGGERED_BATCHES.forEach((pageKeys, batchIndex) => {
      const delay = STAGGER_DELAYS_MS[batchIndex];
      const id = setTimeout(() => {
        pageKeys.forEach((key) => prefetchPage(key));
      }, delay);
      timeouts.push(id);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [prefetchPage]);

  return { prefetchPage, prefetchAllStaggered };
}