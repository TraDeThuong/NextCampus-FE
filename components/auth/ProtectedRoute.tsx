"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  getPortalName,
  getFirstAuthorizedPath,
  hasAnyPermission,
  hasAllPermissions,
  type PortalName,
} from "@/lib/portal";

type ProtectedRouteProps = {
  children: React.ReactNode;
  portal?: PortalName;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  permissionMode?: "ALL" | "ANY";
};

export default function ProtectedRoute({
  children,
  portal,
  allowedRoles,
  requiredPermissions,
  permissionMode = "ALL",
}: ProtectedRouteProps) {
  const { state } = useAuth();
  const router = useRouter();

  const user = state.user;
  const userRole = user?.role;
  const userPermissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);

  // Check authorization
  const isAuthorized = useMemo(() => {
    if (!state.isAuthenticated || !user) return false;

    // Check portal access:
    // If portal is specified, verify that the user's role maps to this portal
    if (portal && getPortalName(userRole) !== portal) {
      return false;
    }

    // Check allowed roles (if provided)
    if (allowedRoles && allowedRoles.length > 0) {
      const normalizedRole = userRole?.trim().toUpperCase();
      const hasRole = allowedRoles.some(
        (r) => r.trim().toUpperCase() === normalizedRole
      );
      if (!hasRole) return false;
    }

    // Check required permissions (if provided)
    if (requiredPermissions && requiredPermissions.length > 0) {
      const checkFn =
        permissionMode === "ANY" ? hasAnyPermission : hasAllPermissions;
      if (!checkFn(userPermissions, requiredPermissions)) {
        return false;
      }
    }

    return true;
  }, [
    state.isAuthenticated,
    user,
    portal,
    userRole,
    allowedRoles,
    requiredPermissions,
    permissionMode,
    userPermissions,
  ]);

  useEffect(() => {
    if (state.isLoading) return;

    if (!state.isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAuthorized) {
      const safePath = getFirstAuthorizedPath(userRole, userPermissions);
      toast.error("Bạn không có quyền truy cập vào trang này");
      router.replace(safePath);
    }
  }, [state.isLoading, state.isAuthenticated, isAuthorized, userRole, userPermissions, router]);

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

  if (!state.isAuthenticated || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
