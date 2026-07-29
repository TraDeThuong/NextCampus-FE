"use client";

import { useQuery } from "@tanstack/react-query";
import { meetingService } from "@/services/meeting.service";
import type { MeetingQueryParams } from "@/types/meeting";

export function useMeetings(params?: MeetingQueryParams) {
  return useQuery({
    queryKey: ["meetings", params],
    queryFn: () => meetingService.getMeetings(params),
    staleTime: 1000 * 60 * 5,
  });
}
