"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { integrationService } from "@/services/integration.service";

interface UseDeleteApiKeyOptions {
  onSuccess?: () => void;
}

export function useDeleteApiKey(options?: UseDeleteApiKeyOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => integrationService.deleteApiKey(id),
    onSuccess: (res) => {
      toast.success(res.message || "Thu hồi API Key thành công");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể thu hồi API Key");
    },
  });
}
