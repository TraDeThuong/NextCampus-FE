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
      toast.success("Weekly evaluation created successfully!");
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluations"] });
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to create weekly evaluation.";
      toast.error(msg);
    },
  });
}
