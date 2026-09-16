"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { meetingService } from "@/services/meeting.service";
import type { RsvpPayload } from "@/types/meeting";

export function useRsvpMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RsvpPayload }) =>
      meetingService.rsvp(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Response sent.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", variables.id] });
    },

    onError: (error: unknown) => {
      const errorMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMsg ?? "Failed to respond to meeting.");
    },
  });
}
