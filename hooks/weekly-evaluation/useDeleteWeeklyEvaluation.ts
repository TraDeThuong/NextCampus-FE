"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";

export function useDeleteWeeklyEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => weeklyEvaluationService.deleteWeeklyEvaluation(id),

    onSuccess: () => {
      toast.success("Xóa đánh giá tuần thành công!");
      queryClient.invalidateQueries({ queryKey: ["weekly-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },

    onError: (error: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(msg ?? "Lỗi khi xóa đánh giá tuần.");
    },
  });
}
