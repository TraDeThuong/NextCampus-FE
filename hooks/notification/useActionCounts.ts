"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { useAuth } from "@/hooks/auth/useAuth";
import type { ActionCountsResponse } from "@/types/notification";

export function useActionCounts(): ActionCountsResponse {
  const { state } = useAuth();

  const { data } = useQuery({
    queryKey: ["action-counts", state.isAuthenticated],
    queryFn: async (): Promise<ActionCountsResponse> => {
      if (!state.isAuthenticated) return {};
      return notificationService.getActionCounts();
    },
    enabled: !!state.isAuthenticated,
    // Làm mới mỗi 2 phút; real-time update đến từ SSE invalidation
    staleTime: 1000 * 60 * 2,
    // Không retry nhiều lần khi lỗi (tránh spam request)
    retry: 1,
  });

  return data ?? {};
}
