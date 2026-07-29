"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { meetingService } from "@/services/meeting.service";

export function useJoinMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingService.joinMeeting(id),

    onSuccess: (_data, id) => {
      toast.success("Joined meeting.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },

    onError: () => {
      toast.error("Failed to join meeting.");
    },
  });
}
