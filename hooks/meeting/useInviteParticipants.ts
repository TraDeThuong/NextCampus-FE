"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { meetingService } from "@/services/meeting.service";
import type { InviteParticipantsPayload } from "@/types/meeting";

export function useInviteParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: InviteParticipantsPayload;
    }) => meetingService.inviteParticipants(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Participants invited successfully.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["meeting", variables.id] });
    },

    onError: () => {
      toast.error("Failed to invite participants.");
    },
  });
}
