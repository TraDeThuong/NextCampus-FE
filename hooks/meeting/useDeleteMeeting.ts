"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { meetingService } from "@/services/meeting.service";

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingService.deleteMeeting(id),

    onSuccess: () => {
      toast.success("Meeting deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },

    onError: (error: unknown) => {
      const errorMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMsg ?? "Failed to delete meeting.");
    },
  });
}
