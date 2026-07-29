"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { meetingService } from "@/services/meeting.service";

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingService.deleteMeeting(id),

    onSuccess: () => {
      toast.success("Meeting deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] }, { exact: false });
    },

    onError: () => {
      toast.error("Failed to delete meeting.");
    },
  });
}
