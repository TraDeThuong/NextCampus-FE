"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskGroupService } from "@/services/task-group.service";
import type {
  GroupAiRecommendation,
  ConfirmGroupAllocationPayload,
} from "@/types/task-allocation";

export function useGroupAiRecommendation(groupId: string, enabled = true) {
  return useQuery<GroupAiRecommendation, Error>({
    queryKey: ["group-ai-recommendation", groupId],
    queryFn: async () => {
      const res = await taskGroupService.getGroupAiRecommendation(groupId);
      return res.data;
    },
    enabled: !!groupId && enabled,
    staleTime: 30_000,
    gcTime: 60_000,
    retry: false,
  });
}

export function useConfirmGroupAiAllocation() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; count: number },
    Error,
    { groupId: string; payload: ConfirmGroupAllocationPayload }
  >({
    mutationFn: async ({ groupId, payload }) => {
      return await taskGroupService.confirmGroupAiAllocation(groupId, payload);
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || "Đã phân công task thành công.");
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task-groups"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
      queryClient.removeQueries({
        queryKey: ["group-ai-recommendation", variables.groupId],
      });
    },
    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Phân công hàng loạt thất bại.";
      toast.error(message);
    },
  });
}
