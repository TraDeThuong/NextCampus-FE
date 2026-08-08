// POST /users/avatar

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";

import { getAvatarPutUrlService, confirmAvatarUploadService } from "@/services/user.service";
import type { UserSuccessResponse, ApiError } from "@/types/user";
import { useAuth } from "@/hooks/auth/useAuth";

export function useUploadAvatar() {
    const queryClient = useQueryClient();
    const { updateUser } = useAuth();

    const mutation = useMutation<UserSuccessResponse, ApiError, File>({
        mutationFn: async (file: File) => {
            // 1. Xin Presigned PUT URL từ server
            const { data: presigned } = await getAvatarPutUrlService(file.type);

            // 2. Upload thẳng lên Cloudflare R2
            await axios.put(presigned.uploadUrl, file, {
                headers: { "Content-Type": file.type },
                withCredentials: false,
            });

            // 3. Xác nhận tải lên thành công để lưu CSDL
            return confirmAvatarUploadService(presigned.filePath);
        },

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