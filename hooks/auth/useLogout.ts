"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getRefreshToken } from "@/lib/token";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/auth/useAuth";

export function useLogout() {
    const router = useRouter();
    const { logout } = useAuth();

    const mutation = useMutation({
        mutationFn: async () => {
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                return { success: true, message: "Logged out" };
            }

            return authService.logout({ refreshToken });
        },

        onSuccess: () => {
            toast.success("Logged out successfully!");
            logout();
            router.replace("/login");
        },

        onError: () => {
            toast.error("Session ended. Redirecting...");
            logout();
            router.replace("/login");
        },
    });

    return {
        logoutMutate: mutation.mutate,
        isLoading: mutation.isPending,
    };
}