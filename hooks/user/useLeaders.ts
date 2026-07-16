"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsersService } from "@/services/user.service";

export function useLeaders() {
    return useQuery({
        queryKey: ["leaders"],
        queryFn: () => getUsersService({ roleName: "LEADER", limit: 100 }),
        staleTime: 1000 * 60 * 1,
    });
}
