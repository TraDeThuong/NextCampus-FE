"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import type { UpdateWeeklyEvaluationPayload } from "@/types/weekly-evaluation";

export function useUpdateWeeklyEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWeeklyEvaluationPayload }) =>
      weeklyEvaluationService.updateWeeklyEvaluation(id, payload),

    onSuccess: (_, { id }) => {
      toast.success("Cập nhật đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluations"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluation", id] });
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Lỗi khi cập nhật đánh giá.";
      toast.error(msg);
    },
  });
}
