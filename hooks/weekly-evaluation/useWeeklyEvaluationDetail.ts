"use client";

import { useQuery } from "@tanstack/react-query";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";

export function useWeeklyEvaluationDetail(id: string) {
  return useQuery({
    queryKey: ["weekly-evaluation", id],
    queryFn: () => weeklyEvaluationService.getWeeklyEvaluation(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
