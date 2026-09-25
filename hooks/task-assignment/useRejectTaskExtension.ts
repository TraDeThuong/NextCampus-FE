"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { RejectExtensionPayload } from "@/types/task-assignment";

export function useRejectTaskExtension() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: RejectExtensionPayload;
    }) => taskAssignmentService.rejectExtension(requestId, payload),

    onSuccess: () => {
      toast.success("Đã từ chối yêu cầu gia hạn.");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["extension-requests"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["task-assignment-extension-requests"],
        exact: false,
      });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Không thể từ chối yêu cầu gia hạn.";
      toast.error(message);
    },
  });
}
