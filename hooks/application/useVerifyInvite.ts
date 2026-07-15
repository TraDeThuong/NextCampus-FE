"use client";

import { useQuery } from "@tanstack/react-query";

import { verifyInviteService } from "@/services/application.service";

export function useVerifyInvite(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: () => verifyInviteService(token),
    enabled: !!token,
    staleTime: 0,
  });
}
