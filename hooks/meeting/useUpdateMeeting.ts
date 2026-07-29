"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
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
      queryClient.invalidateQueries({ queryKey: ["meetings"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["meeting", variables.id] });
    },

    onError: () => {
      toast.error("Failed to update meeting.");
    },
  });
}
