export type PortalName = "admin" | "leader" | "intern";

/**
 * Determine the base portal for a given role:
 * - "LEADER" -> "leader"
 * - "INTERN" -> "intern"
 * - "ADMIN" or any custom administrative role (e.g. HR_MANAGER, COORDINATOR) -> "admin"
 */
export function getPortalName(role?: string | null): PortalName {
  if (!role) return "admin";
  const normalized = role.trim().toUpperCase();
  if (normalized === "LEADER") return "leader";
  if (normalized === "INTERN") return "intern";
  return "admin";
}

/**
 * Determine safe dashboard path for any role:
 * - LEADER -> /leader/dashboard
 * - INTERN -> /intern/dashboard
 * - ADMIN / custom roles -> /admin/dashboard
 */
export function getDashboardPath(role?: string | null): string {
  return `/${getPortalName(role)}/dashboard`;
}

/**
 * Check if the user has a specific permission.
 * Authorization is purely permission-driven.
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  permission: string,
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(permission);
}

/**
 * Check if the user has at least one of the specified permissions.
 * Authorization is purely permission-driven.
 */
export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: string[],
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return permissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if the user has all of the specified permissions.
 * Authorization is purely permission-driven.
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined,
  permissions: string[],
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return permissions.every((perm) => userPermissions.includes(perm));
}
