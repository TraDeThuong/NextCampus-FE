"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { deleteRoleService } from "@/services/rbac.service";

export function useDeleteRole(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoleService(id),
    onSuccess: (res) => {
      toast.success(res.message || "Xóa vai trò thành công.");
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(msg || "Không thể xóa vai trò.");
    },
  });
}
