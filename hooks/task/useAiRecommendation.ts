"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskService } from "@/services/task.service";

export function useAiRecommendation() {
  return useMutation({
    mutationFn: (taskId: string) => taskService.getAiRecommendation(taskId),

    onSuccess: () => {
      toast.success("AI recommendation generated successfully.");
    },

    onError: () => {
      toast.error("Failed to get AI recommendation.");
    },
  });
}
