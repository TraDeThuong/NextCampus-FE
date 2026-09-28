"use client";

import { useQuery } from "@tanstack/react-query";
import { absenceService } from "@/services/absence.service";

export function useAbsenceConflicts(absenceId?: string, enabled = true) {
  return useQuery({
    queryKey: ["absenceConflicts", absenceId],
    queryFn: () => absenceService.getTaskConflicts(absenceId!),
    enabled: enabled && !!absenceId,
    staleTime: 1000 * 60,
  });
}
