"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { syncRolePermissionsService } from "@/services/rbac.service";
import { useAuth } from "@/hooks/auth/useAuth";
import type { SyncRolePermissionsPayload } from "@/types/rbac";

export function useSyncRolePermissions(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: SyncRolePermissionsPayload;
    }) => syncRolePermissionsService(roleId, payload),
    onSuccess: async () => {
      toast.success("Cập nhật ma trận phân quyền thành công.");
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      await refreshUser();
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(msg || "Không thể đồng bộ quyền cho vai trò.");
    },
  });
}
