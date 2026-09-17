"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { syncRolePermissionsService } from "@/services/rbac.service";
import type { SyncRolePermissionsPayload } from "@/types/rbac";

export function useSyncRolePermissions(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: SyncRolePermissionsPayload;
    }) => syncRolePermissionsService(roleId, payload),
    onSuccess: () => {
      toast.success("Cập nhật ma trận phân quyền thành công.");
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
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
