"use client";

import { useQuery } from "@tanstack/react-query";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import type { WeeklyEvaluationQueryParams } from "@/types/weekly-evaluation";

export function useWeeklyEvaluations(params?: WeeklyEvaluationQueryParams) {
  return useQuery({
    queryKey: ["weekly-evaluations", params],
    queryFn: () => weeklyEvaluationService.getEvaluations(params),
    staleTime: 1000 * 60 * 5,
  });
}
