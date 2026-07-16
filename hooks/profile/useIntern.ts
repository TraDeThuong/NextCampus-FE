"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { internService } from "@/services/intern.service";
import type { ApiError } from "@/types/user";

export function useIntern() {
    const query = useQuery({
        queryKey: ["my-intern"],
        queryFn: internService.getMyIntern,
        retry: 1,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (query.isError) {
            toast.error(
                (query.error as ApiError)?.response?.data?.message ??
                    "Failed to load intern profile.",
            );
        }
    }, [query.isError, query.error]);

    return {
        intern: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
