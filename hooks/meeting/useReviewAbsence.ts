"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
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
      queryClient.invalidateQueries({ queryKey: ["meeting-absences"] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["absences"] });
    },

    onError: (error: unknown) => {
      const errorMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMsg ?? "Failed to review absence.");
    },
  });
}
