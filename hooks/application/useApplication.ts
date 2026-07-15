"use client";

import { useQuery } from "@tanstack/react-query";

import { getApplicationService } from "@/services/application.service";

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplicationService(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}
