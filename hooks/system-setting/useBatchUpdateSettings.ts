"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { systemSettingService } from "@/services/system-setting.service";

export function useBatchUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Record<string, string>) =>
      systemSettingService.batchUpdateSettings(settings),

    onSuccess: () => {
      toast.success("Đã cập nhật cấu hình hệ thống thành công!");
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },

    onError: (error: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(msg ?? "Lỗi khi cập nhật cấu hình hệ thống. Vui lòng thử lại.");
    },
  });
}
