"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  getPortalName,
  getDashboardPath,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type PortalName,
} from "@/lib/portal";

export function useRBAC() {
  const { state } = useAuth();
  const user = state.user;
  const role = user?.role;
  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);
  const isAdmin = useMemo(
    () => role?.trim().toUpperCase() === "ADMIN",
    [role]
  );
  const portal: PortalName = useMemo(() => getPortalName(role), [role]);
  const dashboardPath = useMemo(() => getDashboardPath(role), [role]);

  const can = useCallback(
    (permission: string) => hasPermission(permissions, permission),
    [permissions]
  );

  const canAny = useCallback(
    (perms: string[]) => hasAnyPermission(permissions, perms),
    [permissions]
  );

  const canAll = useCallback(
    (perms: string[]) => hasAllPermissions(permissions, perms),
    [permissions]
  );

  return {
    user,
    role,
    permissions,
    isAdmin,
    portal,
    dashboardPath,
    can,
    canAny,
    canAll,
  };
}
