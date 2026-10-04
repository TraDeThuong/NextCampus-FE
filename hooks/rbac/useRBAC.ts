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
  const { state, refreshUser } = useAuth();
  const user = state.user;
  const role = user?.role;
  const portalType = user?.portalType;
  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);
  const isAdmin = useMemo(
    () => portalType === "ADMIN" || role?.trim().toUpperCase() === "ADMIN",
    [portalType, role],
  );
  const isLeader = useMemo(
    () => portalType === "LEADER" || role?.trim().toUpperCase() === "LEADER",
    [portalType, role],
  );
  const isIntern = useMemo(
    () => portalType === "INTERN" || role?.trim().toUpperCase() === "INTERN",
    [portalType, role],
  );
  const portal: PortalName = useMemo(
    () => getPortalName(portalType, role),
    [portalType, role],
  );
  const dashboardPath = useMemo(
    () => getDashboardPath(portalType, role),
    [portalType, role],
  );

  const can = useCallback(
    (permission: string) => hasPermission(permissions, permission),
    [permissions],
  );

  const canAny = useCallback(
    (perms: string[]) => hasAnyPermission(permissions, perms),
    [permissions],
  );

  const canAll = useCallback(
    (perms: string[]) => hasAllPermissions(permissions, perms),
    [permissions],
  );

  return {
    user,
    role,
    portalType,
    permissions,
    isAdmin,
    isLeader,
    isIntern,
    portal,
    dashboardPath,
    can,
    canAny,
    canAll,
    refreshUser,
  };
}
