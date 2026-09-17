"use client";

import { useQuery } from "@tanstack/react-query";
import { getRoleByIdService } from "@/services/rbac.service";

export function useRole(id: string) {
  return useQuery({
    queryKey: ["rbac", "roles", id],
    queryFn: () => getRoleByIdService(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
