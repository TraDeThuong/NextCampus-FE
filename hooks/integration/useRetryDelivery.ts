"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { integrationService } from "@/services/integration.service";

interface UseRetryDeliveryOptions {
  onSuccess?: () => void;
}

export function useRetryDelivery(options?: UseRetryDeliveryOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliveryId: string) => integrationService.retryDelivery(deliveryId),
    onSuccess: (res) => {
      toast.success(res.message || "Đã yêu cầu gửi lại bản tin Webhook");
      queryClient.invalidateQueries({ queryKey: ["webhook-deliveries"] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể gửi lại bản tin Webhook");
    },
  });
}
