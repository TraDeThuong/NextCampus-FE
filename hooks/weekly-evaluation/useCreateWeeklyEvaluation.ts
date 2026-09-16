"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import type { CreateWeeklyEvaluationPayload } from "@/types/weekly-evaluation";

export function useCreateWeeklyEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWeeklyEvaluationPayload) =>
      weeklyEvaluationService.createWeeklyEvaluation(payload),

    onSuccess: () => {
      toast.success("Tạo đánh giá tuần thành công!");
      queryClient.invalidateQueries({ queryKey: ["weekly-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },

    onError: (error: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(msg ?? "Lỗi khi tạo đánh giá tuần.");
    },
  });
}
