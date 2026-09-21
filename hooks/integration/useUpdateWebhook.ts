"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { integrationService } from "@/services/integration.service";
import type { UpdateWebhookPayload } from "@/types/integration";

interface UseUpdateWebhookOptions {
  onSuccess?: () => void;
}

export function useUpdateWebhook(options?: UseUpdateWebhookOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWebhookPayload }) =>
      integrationService.updateWebhook(id, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Cập nhật Webhook thành công");
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể cập nhật Webhook");
    },
  });
}
