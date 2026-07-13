// Dung de cap nhat fullname, email ko the cap nhat duoc 
// PUT /auth/me

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { authService } from "@/services/auth.service";
import type { UpdateProfilePayload, MeSuccessResponse } from "@/types/auth";
import type { ApiError } from "@/types/user";
import { useAuth } from "@/hooks/auth/useAuth";


export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { updateUser } = useAuth();

    const mutation = useMutation<MeSuccessResponse, ApiError, UpdateProfilePayload>({
        mutationFn: (payload: UpdateProfilePayload) =>
            authService.updateMe(payload),

        onSuccess: (data) => {
            toast.success("Profile updated successfully.");

            updateUser({
                fullName: data.data.fullName,
                avatarUrl: data.data.avatarUrl,
            });

            queryClient.invalidateQueries({
                queryKey: ["profile"],
            });
        },

        onError: (error: ApiError) => {
            toast.error(
                error.response?.data?.message ??
                    "Failed to update profile."
            );
        },
    });

    return {
        updateProfile: mutation.mutate,
        updateProfileAsync: mutation.mutateAsync,

        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,

        error: mutation.error,
    };
}