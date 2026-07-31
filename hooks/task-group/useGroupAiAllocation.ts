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
    gcTime: 0,
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
    onSuccess: (data) => {
      toast.success(data.message || "Tasks assigned successfully.");
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task-groups"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
    },
    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Bulk assignment failed.";
      toast.error(message);
    },
  });
}
