"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { meetingService } from "@/services/meeting.service";
import type { UpdateMeetingPayload } from "@/types/meeting";

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMeetingPayload;
    }) => meetingService.updateMeeting(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Meeting updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", variables.id] });
    },

    onError: (error: unknown) => {
      const errorMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMsg ?? "Failed to update meeting.");
    },
  });
}
