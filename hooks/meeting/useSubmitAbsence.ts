"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { meetingService } from "@/services/meeting.service";
import type { SubmitAbsencePayload } from "@/types/meeting";

export function useSubmitAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      payload,
    }: {
      meetingId: string;
      payload: SubmitAbsencePayload;
    }) => meetingService.submitAbsence(meetingId, payload),

    onSuccess: (_data, variables) => {
      toast.success("Absence request submitted.");
      queryClient.invalidateQueries(
        { queryKey: ["meeting-absences", variables.meetingId] },
      );
      queryClient.invalidateQueries({ queryKey: ["meeting", variables.meetingId] });
    },

    onError: (error: unknown) => {
      const errorMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMsg ?? "Failed to submit absence request.");
    },
  });
}
