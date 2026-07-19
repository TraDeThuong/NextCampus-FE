"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import toast from "react-hot-toast";

export function useClearReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.clearReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Đã dọn dẹp các thông báo đã đọc.");
    },
    onError: () => {
      toast.error("Không thể dọn dẹp thông báo đã đọc.");
    },
  });
}
