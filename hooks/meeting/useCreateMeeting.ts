"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { meetingService } from "@/services/meeting.service";
import type { CreateMeetingPayload } from "@/types/meeting";

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) =>
      meetingService.createMeeting(payload),

    onSuccess: () => {
      toast.success("Meeting created successfully.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] }, { exact: false });
    },

    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to create meeting.";
      toast.error(errorMsg);
    },
  });
}
