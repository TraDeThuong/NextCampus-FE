"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { meetingService } from "@/services/meeting.service";

export function useJoinMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingService.joinMeeting(id),

    onSuccess: (_data, id) => {
      toast.success("Joined meeting.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },

    onError: (error: unknown) => {
      const errorMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMsg ?? "Failed to join meeting.");
    },
  });
}
