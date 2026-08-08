"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskService } from "@/services/task.service";
import type { AiRecommendation } from "@/types/task-allocation";

export function useAiRecommendation(taskId: string, enabled = true) {
  return useQuery<AiRecommendation, Error>({
    queryKey: ["ai-recommendation", taskId],
    queryFn: async () => {
      const res = await taskService.getAiRecommendation(taskId);
      const data = res.data;
      if (data.meta.aiFailed) {
        toast("AI không phản hồi - hiển thị kết quả từ thuật toán nội bộ.", { icon: "⚠️", id: "ai-fallback" });
      } else {
        toast.success("AI đã phân tích và đề xuất phân công thành công.", { id: "ai-success" });
      }
      return data;
    },
    enabled: !!taskId && enabled,
    staleTime: 30_000,
    gcTime: 60_000,
    retry: false,
  });
}
