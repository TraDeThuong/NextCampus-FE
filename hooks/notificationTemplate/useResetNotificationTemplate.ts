"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { notificationTemplateService } from "@/services/notificationTemplate.service";

export function useResetNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationTemplateService.reset(id),

    onSuccess: () => {
      toast.success("Template restored to default.");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },

    onError: () => {
      toast.error("Failed to restore default.");
    },
  });
}
