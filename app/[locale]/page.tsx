"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function RootLocalePage() {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.isLoading) {
      if (state.isAuthenticated && state.user) {
        const dashboardPath = `/${state.user.role.toLowerCase()}/dashboard`;
        router.replace(dashboardPath);
      } else {
        router.replace("/login");
      }
    }
  }, [state.isLoading, state.isAuthenticated, state.user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
