"use client";

import { useQuery } from "@tanstack/react-query";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";

export function useInternEvaluationSummary(internId?: string) {
  return useQuery({
    queryKey: ["weeklyEvaluation", "summary", internId],
    queryFn: () => weeklyEvaluationService.getInternSummary(internId!),
    enabled: Boolean(internId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
