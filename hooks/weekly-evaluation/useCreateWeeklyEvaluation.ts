"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import type { CreateWeeklyEvaluationPayload } from "@/types/weekly-evaluation";

export function useCreateWeeklyEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWeeklyEvaluationPayload) =>
      weeklyEvaluationService.createWeeklyEvaluation(payload),

    onSuccess: () => {
      toast.success("Tạo đánh giá tuần thành công!");
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluations"] });
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Lỗi khi tạo đánh giá tuần.";
      toast.error(msg);
    },
  });
}
