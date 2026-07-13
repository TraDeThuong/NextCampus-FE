"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";
import { LoginPayload, ApiErrorResponse } from "@/types/auth";
import { useAuth } from "@/hooks/auth/useAuth";

export type LoginFormValues = LoginPayload & {
    remember: boolean;
};

export function useLogin() {
    const router = useRouter();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    });

    const loginMutation = useMutation({
        mutationFn: (variables: LoginFormValues) =>
            authService.login({
                email: variables.email,
                password: variables.password,
            }),

        onSuccess: (result, variables) => {
            const { accessToken, refreshToken, user } = result.data;

            login(
                { accessToken, refreshToken },
                user,
                variables.remember
            );

            toast.success(`Welcome back, ${user.fullName}!`);

            const targetDashboard = `/${user.role.toLowerCase()}/dashboard`;
            router.push(targetDashboard);
        },

        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(
                error.response?.data?.message ??
                "Authentication failed. Please try again."
            );
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        loginMutation.mutate(data);
    };

    return {
        register,
        errors,
        isSubmitting: loginMutation.isPending,
        handleSubmit: handleSubmit(onSubmit),
    };
}