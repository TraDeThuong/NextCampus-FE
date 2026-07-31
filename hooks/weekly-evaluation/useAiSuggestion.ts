"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import type { AiSuggestionPayload } from "@/types/weekly-evaluation";

export function useAiSuggestion() {
  return useMutation({
    mutationFn: (payload: AiSuggestionPayload) => weeklyEvaluationService.getAiSuggestion(payload),

    onSuccess: () => {
      toast.success("AI suggestions loaded successfully!");
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to load AI suggestions. Check the intern's submissions/reports for this week.";
      toast.error(msg);
    },
  });
}
