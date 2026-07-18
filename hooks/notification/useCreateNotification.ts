"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { notificationService } from "@/services/notification.service";
import type { CreateNotificationPayload } from "@/types/notification";

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotificationPayload) =>
      notificationService.createNotification(payload),

    onSuccess: () => {
      toast.success("Notification sent successfully.");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },

    onError: () => {
      toast.error("Failed to send notification.");
    },
  });
}
