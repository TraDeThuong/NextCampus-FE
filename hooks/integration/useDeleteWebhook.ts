"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { integrationService } from "@/services/integration.service";

interface UseDeleteWebhookOptions {
  onSuccess?: () => void;
}

export function useDeleteWebhook(options?: UseDeleteWebhookOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => integrationService.deleteWebhook(id),
    onSuccess: (res) => {
      toast.success(res.message || "Xóa Webhook thành công");
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể xóa Webhook");
    },
  });
}
