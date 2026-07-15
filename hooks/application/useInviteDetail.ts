"use client";

import { useQuery } from "@tanstack/react-query";

import { getInviteByIdService } from "@/services/application.service";

export function useInviteDetail(id: string) {
  return useQuery({
    queryKey: ["invite-detail", id],
    queryFn: () => getInviteByIdService(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}
