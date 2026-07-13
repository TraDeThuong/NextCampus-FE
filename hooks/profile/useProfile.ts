// Dùng để lấy thông tin người dùng hiện tại.
// GET /auth/me

"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { authService } from "@/services/auth.service";
import type { ApiError } from "@/types/user";

export function useProfile() {
    const query = useQuery({
        queryKey: ["profile"],
        queryFn: authService.me,
        retry: 1,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (query.isError) {
            toast.error(
                (query.error as ApiError)?.response?.data?.message ??
                    "Failed to load profile."
            );
        }
    }, [query.isError, query.error]);

    return {
        profile: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// // Su dung
// const { profile, isLoading } = useProfile();

// if (isLoading) {
//     return <div>Loading...</div>;
// }

// return <h1>{profile?.fullName}</h1>;