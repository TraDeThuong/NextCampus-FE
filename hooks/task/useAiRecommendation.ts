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
        toast("AI did not respond — showing results from internal algorithm.", { icon: "⚠️", id: "ai-fallback" });
      } else {
        toast.success("AI analysis complete — assignment recommendations ready.", { id: "ai-success" });
      }
      return data;
    },
    enabled: !!taskId && enabled,
    gcTime: 0,
    retry: false,
  });
}
