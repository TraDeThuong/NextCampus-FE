"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { maintenanceService } from "@/services/maintenance.service";
import type { EnableMaintenancePayload } from "@/types/maintenance";

interface UseEnableMaintenanceOptions {
  onSuccess?: () => void;
}

export function useEnableMaintenance(options?: UseEnableMaintenanceOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnableMaintenancePayload) =>
      maintenanceService.enable(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Đã kích hoạt chế độ bảo trì hệ thống");
      queryClient.invalidateQueries({ queryKey: ["maintenance-status"] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể kích hoạt chế độ bảo trì");
    },
  });
}
