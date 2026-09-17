"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAssignmentService } from "@/services/task-assignment.service";

export function useBlockTaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      blockedReason,
    }: {
      id: string;
      blockedReason: string;
    }) => taskAssignmentService.blockTask(id, blockedReason),

    onSuccess: (_data, variables) => {
      toast.success("Đã ghi nhận báo cáo bị chặn.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task-assignment", variables.id] });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Không thể gửi báo cáo bị chặn.";
      toast.error(message);
    },
  });
}
