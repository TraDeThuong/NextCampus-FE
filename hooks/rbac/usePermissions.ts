"use client";

import { useQuery } from "@tanstack/react-query";
import { getPermissionsService } from "@/services/rbac.service";
import type { PermissionQueryParams } from "@/types/rbac";

export function usePermissions(params?: PermissionQueryParams) {
  return useQuery({
    queryKey: ["rbac", "permissions", params],
    queryFn: () => getPermissionsService(params),
    staleTime: 1000 * 60 * 30, // Permissions rarely change, 30 mins cache
  });
}
