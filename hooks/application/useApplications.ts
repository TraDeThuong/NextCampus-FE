"use client";

import { useQuery } from "@tanstack/react-query";

import { getApplicationsService } from "@/services/application.service";
import type { ApplicationQueryParams } from "@/types/application";

export function useApplications(params?: ApplicationQueryParams) {
  return useQuery({
    queryKey: ["applications", params],
    queryFn: () => getApplicationsService(params),
    staleTime: 1000 * 60 * 2,
  });
}
