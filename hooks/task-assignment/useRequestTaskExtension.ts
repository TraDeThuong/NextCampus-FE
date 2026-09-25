"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { RequestExtensionPayload } from "@/types/task-assignment";

export function useRequestTaskExtension() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RequestExtensionPayload;
    }) => taskAssignmentService.requestExtension(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Đã gửi yêu cầu xin gia hạn.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["extension-requests"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["task-assignment-extension-requests", variables.id],
      });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Không thể gửi yêu cầu xin gia hạn.";
      toast.error(message);
    },
  });
}
