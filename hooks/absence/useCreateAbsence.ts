"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { absenceService } from "@/services/absence.service";
import type { CreateAbsenceInput } from "@/types/absence";

export function useCreateAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAbsenceInput) => absenceService.createAbsence(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      queryClient.invalidateQueries({ queryKey: ["daily-reports", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["action-counts"] });
    },
  });
}
