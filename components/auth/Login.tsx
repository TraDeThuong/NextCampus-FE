"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import AuthCard from "./AuthCard";
import LoginForm from "./LoginForm";
import Spinner from "../ui/Spinner";

export default function Login() {
    const { state } = useAuth();
    const router = useRouter();

    // Client-side fallback: if user logs in dynamically, redirect to their role dashboard
    useEffect(() => {
        if (!state.isLoading && state.isAuthenticated && state.user) {
            const target = `/${state.user.role.toLowerCase()}/dashboard`;
            router.replace(target);
        }
    }, [state.isLoading, state.isAuthenticated, state.user, router]);

    if (state.isAuthenticated) {
        return null;
    }

    return (
        <AuthCard>
            <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
                <LoginForm />
            </Suspense>
        </AuthCard>
    );
}
