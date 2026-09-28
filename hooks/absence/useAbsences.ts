"use client";

import { useQuery } from "@tanstack/react-query";
import { absenceService } from "@/services/absence.service";
import type { AbsenceQueryParams } from "@/types/absence";

export function useAbsences(params?: AbsenceQueryParams) {
  return useQuery({
    queryKey: ["absences", params],
    queryFn: () => absenceService.getAbsences(params),
    staleTime: 1000 * 60 * 2,
  });
}
