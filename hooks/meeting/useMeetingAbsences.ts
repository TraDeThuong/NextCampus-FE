"use client";

import { useQuery } from "@tanstack/react-query";
import { meetingService } from "@/services/meeting.service";

export function useMeetingAbsences(meetingId: string | undefined) {
  return useQuery({
    queryKey: ["meeting-absences", meetingId],
    queryFn: () => meetingService.getAbsences(meetingId!),
    enabled: !!meetingId,
    staleTime: 1000 * 60 * 5,
  });
}
