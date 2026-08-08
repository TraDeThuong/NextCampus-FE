"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { meetingService } from "@/services/meeting.service";
import type { RsvpPayload } from "@/types/meeting";

export function useRsvpMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RsvpPayload }) =>
      meetingService.rsvp(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Response sent.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["meeting", variables.id] });
    },

    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to send response.";
      toast.error(errorMsg);
    },
  });
}
