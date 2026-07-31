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
      toast.success("Evaluation updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluations"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyEvaluation", id] });
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to update evaluation.";
      toast.error(msg);
    },
  });
}
