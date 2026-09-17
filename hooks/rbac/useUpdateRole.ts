"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { updateRoleService } from "@/services/rbac.service";
import type { UpdateRolePayload } from "@/types/rbac";

export function useUpdateRole(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRoleService(id, payload),
    onSuccess: (res) => {
      toast.success(`Cập nhật vai trò "${res.data.name}" thành công.`);
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(msg || "Không thể cập nhật vai trò.");
    },
  });
}
