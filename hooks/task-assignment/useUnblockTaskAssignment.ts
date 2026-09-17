"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAssignmentService } from "@/services/task-assignment.service";

export function useUnblockTaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskAssignmentService.unblockTask(id),

    onSuccess: (_data, id) => {
      toast.success("Đã mở chặn công việc thành công.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task-assignment", id] });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Không thể mở chặn công việc.";
      toast.error(message);
    },
  });
}
