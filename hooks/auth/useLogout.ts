"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/auth/useAuth";

export function useLogout() {
    const router = useRouter();
    const { logout } = useAuth();

    const mutation = useMutation({
        // No payload needed — the HTTP-only cookie is sent automatically.
        // AuthContext.logout() handles the API call + clearing in-memory state.
        mutationFn: () => logout(),

        onSuccess: () => {
            toast.success("Logged out successfully!");
            router.replace("/login");
        },

        onError: () => {
            toast.error("Session ended. Redirecting...");
            router.replace("/login");
        },
    });

    return {
        logoutMutate: mutation.mutate,
        isLoading: mutation.isPending,
    };
}