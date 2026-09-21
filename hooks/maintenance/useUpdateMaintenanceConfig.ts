"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { maintenanceService } from "@/services/maintenance.service";
import type { UpdateMaintenancePayload } from "@/types/maintenance";

interface UseUpdateMaintenanceConfigOptions {
  onSuccess?: () => void;
}

export function useUpdateMaintenanceConfig(options?: UseUpdateMaintenanceConfigOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMaintenancePayload) =>
      maintenanceService.updateConfig(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Cập nhật cấu hình bảo trì thành công");
      queryClient.invalidateQueries({ queryKey: ["maintenance-status"] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Không thể cập nhật cấu hình bảo trì");
    },
  });
}
