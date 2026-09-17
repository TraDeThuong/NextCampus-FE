"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { createRoleService } from "@/services/rbac.service";
import type { CreateRolePayload } from "@/types/rbac";

export function useCreateRole(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRoleService(payload),
    onSuccess: (res) => {
      toast.success(`Vai trò "${res.data.name}" đã được tạo thành công.`);
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(msg || "Không thể tạo vai trò mới.");
    },
  });
}
