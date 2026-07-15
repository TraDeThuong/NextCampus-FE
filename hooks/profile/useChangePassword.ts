// POST /auth/change-password

"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { authService } from "@/services/auth.service";
import type { ChangePasswordPayload } from "@/types/auth";
import type { ApiError } from "@/types/user";
import type { MessageSuccessResponse } from "@/types/auth";

type ChangePasswordFormValues = ChangePasswordPayload;

export function useChangePassword() {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: {
            errors,
            isDirty,
        },
    } = useForm<ChangePasswordFormValues>({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const mutation = useMutation<MessageSuccessResponse, ApiError, ChangePasswordPayload>({
        mutationFn: (payload: ChangePasswordPayload) =>
            authService.changePassword(payload),

        onSuccess: () => {
            toast.success("Password changed successfully.");

            reset();
        },

        onError: (error: ApiError) => {
            toast.error(
                error.response?.data?.message ??
                    "Failed to change password."
            );
        },
    });

    const onSubmit = (data: ChangePasswordFormValues) => {
        mutation.mutate({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
        });
    };

    return {
        register,
        handleSubmit: handleSubmit(onSubmit),
        watch,
        errors,
        isDirty,

        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        reset,
    };
}