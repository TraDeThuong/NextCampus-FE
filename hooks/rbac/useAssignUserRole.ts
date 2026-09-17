"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { assignUserRoleService } from "@/services/rbac.service";

export function useAssignUserRole(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      assignUserRoleService(userId, { roleId }),
    onSuccess: () => {
      toast.success("Thay đổi vai trò người dùng thành công.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(msg || "Không thể thay đổi vai trò người dùng.");
    },
  });
}
