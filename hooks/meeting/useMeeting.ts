"use client";

import { useQuery } from "@tanstack/react-query";
import { meetingService } from "@/services/meeting.service";

export function useMeeting(id: string | undefined) {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => meetingService.getMeeting(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
