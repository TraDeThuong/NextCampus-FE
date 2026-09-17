"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAssignmentService } from "@/services/task-assignment.service";

export function useStartTaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskAssignmentService.startTask(id),

    onSuccess: (_data, id) => {
      toast.success("Bắt đầu làm công việc thành công.");
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
          : "Không thể bắt đầu công việc.";
      toast.error(message);
    },
  });
}
