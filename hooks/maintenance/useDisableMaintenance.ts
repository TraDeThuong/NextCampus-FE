"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { maintenanceService } from "@/services/maintenance.service";

interface UseDisableMaintenanceOptions {
  onSuccess?: () => void;
}

export function useDisableMaintenance(options?: UseDisableMaintenanceOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => maintenanceService.disable(),
    onSuccess: (data) => {
      toast.success(data.message || "Đã tắt chế độ bảo trì, hệ thống hoạt động bình thường");
      queryClient.invalidateQueries({ queryKey: ["maintenance-status"] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể tắt chế độ bảo trì");
    },
  });
}
