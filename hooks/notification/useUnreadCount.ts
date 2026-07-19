"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { useAuth } from "@/hooks/auth/useAuth";

export function useUnreadCount() {
  const { state } = useAuth();

  return useQuery({
    // Đưa state.isAuthenticated vào queryKey để tự động làm mới khi đăng nhập/đăng xuất
    queryKey: ["notifications", "unread-count", state.isAuthenticated],
    queryFn: async () => {
      if (!state.isAuthenticated) return 0;
      const data = await notificationService.getUnreadCount();
      return data.count ?? 0;
    },
    // Chỉ kích hoạt query khi người dùng đã đăng nhập thành công
    enabled: !!state.isAuthenticated,
    staleTime: 1000 * 60 * 1,
  });
}
