"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authService } from "@/services/auth.service";
import type { ForgotPasswordPayload } from "@/types/auth";

export function useForgotPassword() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordPayload>({
        defaultValues: { email: "" },
    });

    const mutation = useMutation({
        mutationFn: (payload: ForgotPasswordPayload) =>
            authService.forgotPassword(payload),
        onSuccess: () => {
            toast.success("If an account with that email exists, a reset link has been sent.");
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Something went wrong"
            );
        },
    });

    const onSubmit = (data: ForgotPasswordPayload) => {
        mutation.mutate(data);
    };

    return {
        register,
        errors,
        isSubmitting: mutation.isPending,
        handleSubmit: handleSubmit(onSubmit),
    };
}
