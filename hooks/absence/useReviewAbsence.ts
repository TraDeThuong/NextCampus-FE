"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { absenceService } from "@/services/absence.service";
import type { ReviewAbsenceInput } from "@/types/absence";

export function useReviewAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewAbsenceInput }) =>
      absenceService.reviewAbsence(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["action-counts"] });
    },
  });
}
