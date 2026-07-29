"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";

export function useMarkReviewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => weeklyEvaluationService.markReviewed(id),
    onSuccess: (_, id) => {
      // Invalidate chi tiết và danh sách để cập nhật trạng thái "đã xem"
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluation", id] });
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluations"] });
    },
  });
}
