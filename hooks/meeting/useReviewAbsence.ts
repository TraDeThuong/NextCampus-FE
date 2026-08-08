"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { meetingService } from "@/services/meeting.service";
import type { ReviewAbsencePayload } from "@/types/meeting";

export function useReviewAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      absenceId,
      payload,
    }: {
      absenceId: string;
      payload: ReviewAbsencePayload;
    }) => meetingService.reviewAbsence(absenceId, payload),

    onSuccess: () => {
      toast.success("Absence request reviewed.");
      queryClient.invalidateQueries(
        { queryKey: ["meeting-absences"] },
        { exact: false },
      );
      queryClient.invalidateQueries({ queryKey: ["meetings"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["absences"] }, { exact: false });
    },

    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to review absence.";
      toast.error(errorMsg);
    },
  });
}
