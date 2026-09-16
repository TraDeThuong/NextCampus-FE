"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { meetingService } from "@/services/meeting.service";
import type { CreateMeetingPayload } from "@/types/meeting";

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) =>
      meetingService.createMeeting(payload),

    onSuccess: () => {
      toast.success("Meeting created successfully.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },

    onError: (error: unknown) => {
      const errorMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMsg ?? "Failed to create meeting.");
    },
  });
}
