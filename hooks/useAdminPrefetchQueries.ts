"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { leaderService } from "@/services/leader.service";
import { getUsersService } from "@/services/user.service";
import { getApplicationInvitesService } from "@/services/application.service";
import { notificationTemplateService } from "@/services/notificationTemplate.service";
import { meetingService } from "@/services/meeting.service";
import { regulationService } from "@/services/regulation.service";
import { activityLogService } from "@/services/activity-log.service";
import { authService } from "@/services/auth.service";
import api from "@/lib/axios";

type PrefetchBatch = {
  queryKey: unknown[];
  queryFn: () => Promise<unknown>;
  staleTime?: number;
};

const PAGE_PREFETCH_MAP: Record<string, PrefetchBatch[]> = {
  leaders: [
    { queryKey: ["leaders", {}], queryFn: () => leaderService.getLeaders({}) },
    { queryKey: ["leaders", { limit: 1 }], queryFn: () => leaderService.getLeaders({ limit: 1 }) },
    { queryKey: ["leaders", { isActive: true, limit: 1 }], queryFn: () => leaderService.getLeaders({ isActive: true, limit: 1 }) },
    { queryKey: ["leaders", { isActive: false, limit: 1 }], queryFn: () => leaderService.getLeaders({ isActive: false, limit: 1 }) },
  ],
  "admin-team": [
    { queryKey: ["users", { roleName: "ADMIN" }], queryFn: () => getUsersService({ roleName: "ADMIN" }) },
    { queryKey: ["users", { roleName: "ADMIN", limit: 1 }], queryFn: () => getUsersService({ roleName: "ADMIN", limit: 1 }) },
    { queryKey: ["users", { roleName: "ADMIN", isActive: true, limit: 1 }], queryFn: () => getUsersService({ roleName: "ADMIN", isActive: true, limit: 1 }) },
    { queryKey: ["users", { roleName: "ADMIN", isActive: false, limit: 1 }], queryFn: () => getUsersService({ roleName: "ADMIN", isActive: false, limit: 1 }) },
  ],
  onboarding: [
    { queryKey: ["application-invites", {}], queryFn: () => getApplicationInvitesService({}) },
  ],
  emails: [
    { queryKey: ["notification-templates"], queryFn: () => notificationTemplateService.getAll() },
  ],
  meetings: [
    { queryKey: ["meetings", undefined], queryFn: () => meetingService.getMeetings() },
    { queryKey: ["meetings", { limit: 1 }], queryFn: () => meetingService.getMeetings({ limit: 1 }) },
    { queryKey: ["meetings", { status: "SCHEDULED", limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "SCHEDULED", limit: 1 }) },
    { queryKey: ["meetings", { status: "ONGOING", limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "ONGOING", limit: 1 }) },
    { queryKey: ["meetings", { status: "COMPLETED", limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "COMPLETED", limit: 1 }) },
    { queryKey: ["meetings", { status: "CANCELLED", limit: 1 }], queryFn: () => meetingService.getMeetings({ status: "CANCELLED", limit: 1 }) },
    {
      queryKey: ["absences", "pending"],
      queryFn: async () => {
        const res = await api.get("/meetings/absences/pending");
        return res.data;
      },
    },
  ],
  policies: [
    { queryKey: ["regulations", {}], queryFn: () => regulationService.getRegulations({}) },
  ],
  "activity-logs": [
    { queryKey: ["activity-logs", { page: 1, limit: 20 }], queryFn: () => activityLogService.getActivityLogs({ page: 1, limit: 20 }) },
  ],
  profile: [
    { queryKey: ["profile"], queryFn: () => authService.me() },
  ],
};

const STAGGERED_BATCHES: string[][] = [
  ["leaders", "admin-team"],
  ["onboarding", "meetings", "policies"],
  ["emails", "activity-logs", "profile"],
];

const STAGGER_DELAYS_MS = [300, 600, 900];

export function useAdminPrefetchQueries() {
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
        }).catch(() => {
          // Silent fail — page will fetch on-demand when navigated to
        });
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

  return { prefetchPage, prefetchAllStaggered, PAGE_PREFETCH_MAP };
}