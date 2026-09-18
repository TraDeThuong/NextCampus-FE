"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsersService } from "@/services/user.service";
import type { UserQueryParams } from "@/types/user";

export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsersService(params),
    staleTime: 1000 * 60 * 2,
  });
}
