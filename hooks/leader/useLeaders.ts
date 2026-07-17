"use client";

import { useQuery } from "@tanstack/react-query";
import { leaderService } from "@/services/leader.service";
import type { LeaderQueryParams } from "@/types/leader";

export function useLeaders(params?: LeaderQueryParams) {
    return useQuery({
        queryKey: ["leaders", params],
        queryFn: () => leaderService.getLeaders(params),
        staleTime: 1000 * 60 * 2,
    });
}
