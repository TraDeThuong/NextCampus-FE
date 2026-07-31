"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";
import { ApiErrorResponse } from "@/types/auth";
import { useAuth } from "@/hooks/auth/useAuth";
import { getRememberedEmail, saveRememberedEmail, clearRememberedEmail } from "@/lib/token";

export interface LoginFormValues {
    email: string;
    password: string;
    remember: boolean;
}

export function useLogin() {
    const router = useRouter();
    const { login } = useAuth();

    const savedEmail = typeof window !== "undefined" ? getRememberedEmail() : null;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<LoginFormValues>({
        defaultValues: {
            email: savedEmail ?? "",
            password: "",
            remember: !!savedEmail,
        },
    });

    // Sync the pre-filled email after hydration
    useEffect(() => {
        if (savedEmail) {
            setValue("email", savedEmail);
            setValue("remember", true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loginMutation = useMutation({
        mutationFn: (variables: LoginFormValues) =>
            // Pass rememberMe to the server so it can set the correct cookie duration.
            // remember=true  → persistent cookie (maxAge = 7d)
            // remember=false → session cookie (cleared when browser closes)
            authService.login({
                email: variables.email,
                password: variables.password,
                rememberMe: variables.remember,
            }),

        onSuccess: (result, variables) => {
            const { accessToken } = result.data;
            const { user } = result.data;

            // Persist or clear the pre-fill email based on user's choice
            if (variables.remember) {
                saveRememberedEmail(variables.email);
            } else {
                clearRememberedEmail();
            }

            // No `remember` param — cookie duration is already set by the server
            login({ accessToken }, user);

            toast.success(`Welcome back, ${user.fullName}!`);

            const targetDashboard = `/${user.role.toLowerCase()}/dashboard`;
            router.push(targetDashboard);
        },

        onError: (error: AxiosError<ApiErrorResponse>) => {
            const code = error.response?.data?.code;
            const message = error.response?.data?.message;

            if (code === "USER_INACTIVE" || message?.toLowerCase().includes("inactive")) {
                toast.error("Your account has been locked or deactivated.");
            } else if (message === "Invalid credentials" || error.response?.status === 401) {
                toast.error("Invalid email or password.");
            } else {
                toast.error(message || "Login failed. Please try again.");
            }
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        loginMutation.mutate(data);
    };

    const formatLoginError = () => {
        if (!loginMutation.error) return undefined;
        const code = loginMutation.error.response?.data?.code;
        const msg = loginMutation.error.response?.data?.message;

        if (code === "USER_INACTIVE" || msg?.toLowerCase().includes("inactive")) {
            return "Your account has been locked or deactivated.";
        }
        if (msg === "Invalid credentials" || loginMutation.error.response?.status === 401) {
            return "Invalid email or password.";
        }
        return msg;
    };

    return {
        register,
        errors,
        isSubmitting: loginMutation.isPending,
        loginError: formatLoginError(),
        handleSubmit: handleSubmit(onSubmit),
    };
}