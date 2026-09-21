// Dung de cap nhat fullname, email ko the cap nhat duoc 
// PUT /auth/profile

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { authService } from "@/services/auth.service";
import type { UpdateProfilePayload, MessageSuccessResponse } from "@/types/auth";
import type { ApiError } from "@/types/user";
import { useAuth } from "@/hooks/auth/useAuth";

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { updateUser } = useAuth();

    const mutation = useMutation<MessageSuccessResponse, ApiError, UpdateProfilePayload>({
        mutationFn: (payload: UpdateProfilePayload) =>
            authService.updateMe(payload),

        onSuccess: (_data, variables) => {
            toast.success("Profile updated successfully.");

            if (variables.fullName) {
                updateUser({
                    fullName: variables.fullName,
                });
            }

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