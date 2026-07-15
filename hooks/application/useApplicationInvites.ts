"use client";

import { useQuery } from "@tanstack/react-query";

import { getApplicationInvitesService } from "@/services/application.service";
import type { GetApplicationInvitesParams } from "@/types/application";

export function useApplicationInvites(params?: GetApplicationInvitesParams) {
  return useQuery({
    queryKey: ["application-invites", params],
    queryFn: () => getApplicationInvitesService(params),
    staleTime: 1000 * 60 * 2,
  });
}
