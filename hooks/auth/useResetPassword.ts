"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import axios from "axios";
import { authService } from "@/services/auth.service";

type ResetPasswordFormValues = {
    password: string;
    confirmPassword: string;
};

export function useResetPassword() {
    const t = useTranslations("auth");
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
            toast.success(t("resetSuccess"));
            router.push("/login");
        },
        onError: (error: unknown) => {
            const msg = axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;
            toast.error(
                msg ?? t("resetFailed")
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
