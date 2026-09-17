"use client";

import { useQuery } from "@tanstack/react-query";
import { getRolesService } from "@/services/rbac.service";
import type { RoleQueryParams } from "@/types/rbac";

export function useRoles(params?: RoleQueryParams) {
  return useQuery({
    queryKey: ["rbac", "roles", params],
    queryFn: () => getRolesService(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
