"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { integrationService } from "@/services/integration.service";
import type { CreateWebhookPayload } from "@/types/integration";

interface UseCreateWebhookOptions {
  onSuccess?: () => void;
}

export function useCreateWebhook(options?: UseCreateWebhookOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWebhookPayload) =>
      integrationService.createWebhook(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Đăng ký Webhook endpoint thành công");
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể đăng ký Webhook endpoint");
    },
  });
}
