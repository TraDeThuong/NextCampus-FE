// POST /users/avatar

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { uploadAvatarService } from "@/services/user.service";
import type { UserSuccessResponse, ApiError } from "@/types/user";
import { useAuth } from "@/hooks/auth/useAuth";

export function useUploadAvatar() {
    const queryClient = useQueryClient();
    const { updateUser } = useAuth();

    const mutation = useMutation<UserSuccessResponse, ApiError, File>({
        mutationFn: (file: File) => uploadAvatarService(file),

        onSuccess: (data) => {
            toast.success("Avatar updated successfully.");

            updateUser({ avatarUrl: data.data.avatarUrl });

            queryClient.invalidateQueries({
                queryKey: ["profile"],
            });
        },

        onError: (error: ApiError) => {
            toast.error(
                error.response?.data?.message ??
                    "Failed to upload avatar."
            );
        },
    });

    return {
        uploadAvatar: mutation.mutate,
        uploadAvatarAsync: mutation.mutateAsync,

        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,

        error: mutation.error,
    };
}