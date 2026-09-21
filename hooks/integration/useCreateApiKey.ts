"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { integrationService } from "@/services/integration.service";
import type { CreateApiKeyPayload, CreateApiKeyResult } from "@/types/integration";

interface UseCreateApiKeyOptions {
  onSuccess?: (result: CreateApiKeyResult) => void;
}

export function useCreateApiKey(options?: UseCreateApiKeyOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApiKeyPayload) =>
      integrationService.createApiKey(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Tạo API Key thành công");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      options?.onSuccess?.(res.data);
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể tạo API Key");
    },
  });
}
