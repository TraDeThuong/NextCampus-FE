"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/auth/useAuth";

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { state } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (state.isLoading) return;

        if (!state.isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (allowedRoles && state.user && !allowedRoles.includes(state.user.role)) {
            const userDashboard = `/${state.user.role.toLowerCase()}/dashboard`;
            toast.error("You do not have permission to access this page");
            router.replace(userDashboard);
        }
    }, [state.isLoading, state.isAuthenticated, state.user, allowedRoles, router]);

    if (state.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-primary-dark">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-primary-light" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-muted text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!state.isAuthenticated) {
        return null;
    }

    if (allowedRoles && state.user && !allowedRoles.includes(state.user.role)) {
        return null;
    }

    return <>{children}</>;
}
