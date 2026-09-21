"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { integrationService } from "@/services/integration.service";

interface UseTestWebhookOptions {
  onSuccess?: (deliveryId: string) => void;
}

export function useTestWebhook(options?: UseTestWebhookOptions) {
  return useMutation({
    mutationFn: (id: string) => integrationService.testPingWebhook(id),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Đã gửi bản tin Ping kiểm tra đến Webhook");
      options?.onSuccess?.(res.data.deliveryId);
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Gửi Ping kiểm tra thất bại");
    },
  });
}
