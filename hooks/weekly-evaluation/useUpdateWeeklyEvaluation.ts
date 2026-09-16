"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import type { UpdateWeeklyEvaluationPayload } from "@/types/weekly-evaluation";

export function useUpdateWeeklyEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWeeklyEvaluationPayload }) =>
      weeklyEvaluationService.updateWeeklyEvaluation(id, payload),

    onSuccess: (_, { id }) => {
      toast.success("Cập nhật đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["weekly-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-evaluation", id] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },

    onError: (error: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(msg ?? "Lỗi khi cập nhật đánh giá.");
    },
  });
}
