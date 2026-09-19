"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useTranslations } from "next-intl";
import { systemSettingService } from "@/services/system-setting.service";

interface UseBatchUpdateSettingsOptions {
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useBatchUpdateSettings(options?: UseBatchUpdateSettingsOptions) {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.settings");

  return useMutation({
    mutationFn: (settings: Record<string, string | number | boolean>) => {
      const payload: Record<string, string> = {};
      for (const [key, val] of Object.entries(settings)) {
        payload[key] = String(val);
      }
      return systemSettingService.batchUpdateSettings(payload);
    },

    onSuccess: () => {
      toast.success(options?.successMessage ?? t("saveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      options?.onSuccess?.();
    },

    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg ?? options?.errorMessage ?? t("saveError"));
    },
  });
}
