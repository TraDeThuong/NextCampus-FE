"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { leaderService } from "@/services/leader.service";
import type { ApiError } from "@/types/user";

export function useLeader() {
    const query = useQuery({
        queryKey: ["my-leader"],
        queryFn: leaderService.getMyLeader,
        retry: 1,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (query.isError) {
            toast.error(
                (query.error as ApiError)?.response?.data?.message ??
                    "Failed to load leader profile.",
            );
        }
    }, [query.isError, query.error]);

    return {
        leader: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
