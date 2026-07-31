"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";

export function useDeleteWeeklyEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => weeklyEvaluationService.deleteWeeklyEvaluation(id),

    onSuccess: () => {
      toast.success("Weekly evaluation deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluations"] });
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to delete weekly evaluation.";
      toast.error(msg);
    },
  });
}
