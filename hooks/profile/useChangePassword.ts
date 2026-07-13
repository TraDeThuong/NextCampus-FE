// PATCH /users/change-password

"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { changePasswordService } from "@/services/user.service";
import type { ChangePasswordPayload, ApiError } from "@/types/user";
import type { MessageSuccessResponse } from "@/types/auth";

type ChangePasswordFormValues = ChangePasswordPayload & {
    confirmPassword: string;
};

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
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const mutation = useMutation<MessageSuccessResponse, ApiError, ChangePasswordPayload>({
        mutationFn: (payload: ChangePasswordPayload) =>
            changePasswordService(payload),

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
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
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