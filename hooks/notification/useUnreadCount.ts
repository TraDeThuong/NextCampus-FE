"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { useAuth } from "@/hooks/auth/useAuth";

export function useUnreadCount() {
  const { state } = useAuth();

  return useQuery({
    // Include state.isAuthenticated in queryKey to auto-refresh on login/logout
    queryKey: ["notifications", "unread-count", state.isAuthenticated],
    queryFn: async () => {
      if (!state.isAuthenticated) return 0;
      const data = await notificationService.getUnreadCount();
      return data.count ?? 0;
    },
    // Only activate query when user is authenticated
    enabled: !!state.isAuthenticated,
    staleTime: 1000 * 60 * 1,
  });
}
