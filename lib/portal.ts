export type PortalName = "admin" | "leader" | "intern";
export type PortalType = "ADMIN" | "LEADER" | "INTERN";

export interface PortalContext {
  portalType?: string | null;
  role?: string | null;
}

/**
 * Determine the base portal for a given user context:
 * - Prioritize portalType ("ADMIN" -> "admin", "LEADER" -> "leader", "INTERN" -> "intern")
 * - Fallback to role name string if portalType is not yet set
 * - Defaults to "admin"
 */
export function getPortalName(
  portalTypeOrContext?: string | PortalContext | null,
  fallbackRole?: string | null,
): PortalName {
  if (!portalTypeOrContext) {
    if (!fallbackRole) return "admin";
    const normalizedRole = fallbackRole.trim().toUpperCase();
    if (normalizedRole === "LEADER") return "leader";
    if (normalizedRole === "INTERN") return "intern";
    return "admin";
  }

  let portalType: string | undefined | null;
  let role: string | undefined | null;

  if (typeof portalTypeOrContext === "object") {
    portalType = portalTypeOrContext.portalType;
    role = portalTypeOrContext.role;
  } else {
    portalType = portalTypeOrContext;
    role = fallbackRole;
  }

  const normalizedType = portalType?.trim().toUpperCase();
  if (normalizedType === "ADMIN") return "admin";
  if (normalizedType === "LEADER") return "leader";
  if (normalizedType === "INTERN") return "intern";

  const normalizedRole = role?.trim().toUpperCase();
  if (normalizedRole === "LEADER") return "leader";
  if (normalizedRole === "INTERN") return "intern";

  return "admin";
}

/**
 * Determine safe dashboard path based on portalType / role:
 * - LEADER -> /leader/dashboard
 * - INTERN -> /intern/dashboard
 * - ADMIN / custom roles -> /admin/dashboard
 */
export function getDashboardPath(
  portalTypeOrContext?: string | PortalContext | null,
  fallbackRole?: string | null,
): string {
  return `/${getPortalName(portalTypeOrContext, fallbackRole)}/dashboard`;
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

/**
 * Determine the first accessible path based on user role and permissions,
 * falling back to the user's profile page which is always accessible.
 */
export function getFirstAuthorizedPath(
  portalTypeOrContext?: string | PortalContext | null,
  permissions: string[] = [],
  fallbackRole?: string | null,
): string {
  const portal = getPortalName(portalTypeOrContext, fallbackRole);

  if (portal === "admin") {
    if (hasPermission(permissions, "STATS_ADMIN_READ")) return "/admin/dashboard";
    if (hasPermission(permissions, "USER_READ")) return "/admin/admin-team";
    if (hasPermission(permissions, "DEPARTMENT_READ")) return "/admin/department";
    if (hasPermission(permissions, "LEADER_READ")) return "/admin/leaders";
    if (hasPermission(permissions, "APPLICATION_READ")) return "/admin/onboarding";
    if (hasPermission(permissions, "INTERN_READ")) return "/admin/interns";
    if (hasPermission(permissions, "MEETING_READ")) return "/admin/meetings";
    if (hasPermission(permissions, "ROLE_READ")) return "/admin/roles";
    if (hasAnyPermission(permissions, [
      "SYSTEM_CONFIG_READ",
      "MAINTENANCE_READ",
      "MAINTENANCE_MANAGE",
      "API_KEY_READ",
      "API_KEY_MANAGE",
      "WEBHOOK_READ",
      "WEBHOOK_MANAGE",
      "CRON_JOB_READ",
      "CRON_JOB_MANAGE",
    ])) return "/admin/settings";
    return "/admin/profile";
  }

  if (portal === "leader") {
    if (hasAnyPermission(permissions, ["STATS_LEADER_READ", "STATS_ADMIN_READ"])) return "/leader/dashboard";
    if (hasPermission(permissions, "INTERN_READ")) return "/leader/interns";
    if (hasPermission(permissions, "DEPARTMENT_READ")) return "/leader/department";
    if (hasPermission(permissions, "TASK_GROUP_READ")) return "/leader/task-groups";
    if (hasPermission(permissions, "TASK_READ")) return "/leader/tasks";
    if (hasPermission(permissions, "MEETING_READ")) return "/leader/meetings";
    if (hasPermission(permissions, "DAILY_REPORT_READ")) return "/leader/daily-reports";
    if (hasPermission(permissions, "WEEKLY_EVALUATION_READ")) return "/leader/weekly-evaluation";
    return "/leader/profile";
  }

  if (portal === "intern") {
    if (hasAnyPermission(permissions, ["STATS_INTERN_READ", "STATS_LEADER_READ", "STATS_ADMIN_READ"])) return "/intern/dashboard";
    if (hasAnyPermission(permissions, ["TASK_READ", "TASK_ASSIGNMENT_READ"])) return "/intern/task";
    if (hasPermission(permissions, "MEETING_READ")) return "/intern/meetings";
    if (hasPermission(permissions, "DAILY_REPORT_READ")) return "/intern/daily-report";
    if (hasPermission(permissions, "WEEKLY_EVALUATION_READ")) return "/intern/weekly-evaluation";
    return "/intern/profile";
  }

  return "/login";
}
