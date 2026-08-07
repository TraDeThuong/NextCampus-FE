// hooks/useLeaderPrefetchQueries.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { statsService } from "@/services/stats.service";
import { internService } from "@/services/intern.service";
import { taskService } from "@/services/task.service";
import { taskGroupService } from "@/services/task-group.service";
import { departmentService } from "@/services/department.service";
import { meetingService } from "@/services/meeting.service";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import { authService } from "@/services/auth.service";
import { leaderService } from "@/services/leader.service";
import api from "@/lib/axios";

type PrefetchBatch = {
  queryKey: unknown[];
  queryFn: () => Promise<unknown>;
  staleTime?: number;
};

function buildLeaderPageMap(leaderId?: string): Record<string, PrefetchBatch[]> {
  return {
    // Dashboard + Interns (fix existing prefetch keys)
    dashboard: [
      { queryKey: ["stats", "leader"], queryFn: () => statsService.getLeaderStats(), staleTime: 1000 * 60 * 5 },
    ],
    interns: [
      { queryKey: ["interns", undefined], queryFn: () => internService.getInterns(), staleTime: 1000 * 60 * 2 },
      ...(leaderId ? [
        { queryKey: ["interns", { leaderId, limit: 1 }], queryFn: () => internService.getInterns({ leaderId, limit: 1 }) },
        { queryKey: ["interns", { leaderId, status: "ACTIVE" as const, limit: 1 }], queryFn: () => internService.getInterns({ leaderId, status: "ACTIVE", limit: 1 }) },
        { queryKey: ["interns", { leaderId, status: "COMPLETED" as const, limit: 1 }], queryFn: () => internService.getInterns({ leaderId, status: "COMPLETED", limit: 1 }) },
        { queryKey: ["interns", { leaderId, status: "DROPPED" as const, limit: 1 }], queryFn: () => internService.getInterns({ leaderId, status: "DROPPED", limit: 1 }) },
      ] : []),
    ],
    department: [
      { queryKey: ["departments", undefined], queryFn: () => departmentService.getDepartments(), staleTime: 1000 * 60 * 10 },
    ],
    tasks: [
      { queryKey: ["tasks", undefined], queryFn: () => taskService.getTasks(), staleTime: 1000 * 60 * 5 },
      { queryKey: ["task-groups"], queryFn: () => taskGroupService.getAll(), staleTime: 1000 * 60 * 5 },
    ],
    meetings: [
      { queryKey: ["meetings", undefined], queryFn: () => meetingService.getMeetings(), staleTime: 1000 * 60 * 5 },
      { queryKey: ["meetings", { limit: 1 }], queryFn: () => meetingService.getMeetings({ limit: 1 }) },
      { queryKey: ["meetings", { status: "SCHEDULED" as const, limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "SCHEDULED", limit: 1 }) },
      { queryKey: ["meetings", { status: "ONGOING" as const, limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "ONGOING", limit: 1 }) },
      { queryKey: ["meetings", { status: "COMPLETED" as const, limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "COMPLETED", limit: 1 }) },
      { queryKey: ["meetings", { status: "CANCELLED" as const, limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "CANCELLED", limit: 1 }) },
      { queryKey: ["absences", "my"], queryFn: async () => { const res = await api.get("/meetings/absences/my"); return new Set(res.data.data.map((a: { meetingId: string }) => a.meetingId)); } },
    ],
    "weekly-evaluation": [
      { queryKey: ["weeklyEvaluations", { page: 1, limit: 10, sortBy: "week" as const, order: "desc" as const }], queryFn: () => weeklyEvaluationService.getWeeklyEvaluations({ page: 1, limit: 10, sortBy: "week", order: "desc" }), staleTime: 1000 * 60 * 5 },
    ],
    profile: [
      { queryKey: ["profile"], queryFn: () => authService.me(), staleTime: 1000 * 60 * 5 },
      { queryKey: ["my-leader"], queryFn: () => leaderService.getMyLeader(), staleTime: 1000 * 60 * 5 },
    ],
  };
}

export function useLeaderPrefetchQueries() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const prefetchPage = useCallback(
    (pageKey: string) => {
      const pageMap = buildLeaderPageMap(user?.id);
      const batches = pageMap[pageKey];
      if (!batches) return;
      for (const batch of batches) {
        queryClient.prefetchQuery({
          queryKey: batch.queryKey,
          queryFn: batch.queryFn,
          staleTime: batch.staleTime ?? 1000 * 60 * 5,
        }).catch(() => {});
      }
    },
    [queryClient, user?.id],
  );

  const prefetchAllStaggered = useCallback(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const batches = [
      { delay: 300, pages: ["dashboard", "interns", "department", "tasks"] },
      { delay: 600, pages: ["meetings", "profile"] },
      { delay: 900, pages: ["weekly-evaluation"] },
    ];

    for (const { delay, pages } of batches) {
      const id = setTimeout(() => {
        pages.forEach((key) => prefetchPage(key));
      }, delay);
      timeouts.push(id);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [prefetchPage]);

  return { prefetchPage, prefetchAllStaggered };
}