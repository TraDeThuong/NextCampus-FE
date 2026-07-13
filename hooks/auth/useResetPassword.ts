"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/services/auth.service";

type ResetPasswordFormValues = {
    password: string;
    confirmPassword: string;
};

export function useResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        defaultValues: { password: "", confirmPassword: "" },
    });

    const mutation = useMutation({
        mutationFn: (password: string) =>
            authService.resetPassword({ token: token!, password }),
        onSuccess: () => {
            toast.success("Password reset successfully. You can now sign in.");
            router.push("/login");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message ?? "Failed to reset password. The link may have expired."
            );
        },
    });

    const onSubmit = (data: ResetPasswordFormValues) => {
        if (!token) {
            toast.error("Reset token is missing or invalid.");
            return;
        }
        mutation.mutate(data.password);
    };

    return {
        register,
        errors,
        isSubmitting: mutation.isPending,
        handleSubmit: handleSubmit(onSubmit),
        watch,
        token,
    };
}
