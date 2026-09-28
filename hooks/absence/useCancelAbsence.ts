"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { absenceService } from "@/services/absence.service";

export function useCancelAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => absenceService.cancelAbsence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      queryClient.invalidateQueries({ queryKey: ["action-counts"] });
    },
  });
}
