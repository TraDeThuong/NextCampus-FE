"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface MyAbsenceResponse {
  success: boolean;
  data: { meetingId: string; status: string }[];
}

export function useMyApprovedAbsences() {
  return useQuery({
    queryKey: ["absences", "my"],
    queryFn: async () => {
      const res = await api.get<MyAbsenceResponse>("/meetings/absences/my");
      return new Set(res.data.data.map((a) => a.meetingId));
    },
    staleTime: 1000 * 60 * 2,
  });
}
