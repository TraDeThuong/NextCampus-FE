"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";
import { LoginPayload, ApiErrorResponse } from "@/types/auth";

export type LoginFormValues = LoginPayload & {
    remember: boolean;
};

export function useLogin() {
    const router = useRouter();

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
            // 3. Extract accessToken, refreshToken, and user from login response
            const { accessToken, refreshToken, user } = result.data;

            // Handle "Remember Me" preference
            if (variables.remember) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
            } else {
                sessionStorage.setItem("accessToken", accessToken);
                sessionStorage.setItem("refreshToken", refreshToken);
            }

            toast.success(`Welcome back, ${user.fullName}!`);
            
            // 3. Map role to dashboard path dynamically
            // Replace router.push("/dashboard") with router.push(`/${user.role.toLowerCase()}/dashboard`)
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