"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { notificationTemplateService } from "@/services/notificationTemplate.service";
import type { UpsertNotificationTemplatePayload } from "@/types/notificationTemplate";

export function useUpsertNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      payload,
    }: {
      type: string;
      payload: UpsertNotificationTemplatePayload;
    }) => notificationTemplateService.upsertByType(type, payload),

    onSuccess: () => {
      toast.success("Template saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },

    onError: () => {
      toast.error("Failed to save template.");
    },
  });
}
