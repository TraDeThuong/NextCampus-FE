// ─── Permission Entity ───────────────────────────────────────────────────

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Role Entity ─────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// ─── Payloads ───────────────────────────────────────────────────────────

export interface RoleQueryParams {
  search?: string;
  sortBy?: "name" | "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export interface SyncRolePermissionsPayload {
  permissionIds: string[];
}

export interface AssignUserRolePayload {
  roleId: string;
}

export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  resource?: string;
}

// ─── Responses ──────────────────────────────────────────────────────────

export interface RoleListResponse {
  success: boolean;
  data: Role[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RoleDetailResponse {
  success: boolean;
  data: Role;
}

export interface PermissionListResponse {
  success: boolean;
  data: Permission[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
