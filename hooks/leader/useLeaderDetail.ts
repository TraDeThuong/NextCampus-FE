"use client";

import { useQuery } from "@tanstack/react-query";
import { leaderService } from "@/services/leader.service";

export function useLeaderDetail(id: string | undefined) {
    return useQuery({
        queryKey: ["leader", id],
        queryFn: () => leaderService.getLeader(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}
