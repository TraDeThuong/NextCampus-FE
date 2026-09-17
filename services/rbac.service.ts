import api from "@/lib/axios";
import type {
  RoleListResponse,
  RoleDetailResponse,
  RoleQueryParams,
  CreateRolePayload,
  UpdateRolePayload,
  PermissionListResponse,
  PermissionQueryParams,
  SyncRolePermissionsPayload,
  AssignUserRolePayload,
} from "@/types/rbac";

/**
 * 1. Lấy danh sách vai trò (kèm tìm kiếm, phân trang và đếm user)
 */
export const getRolesService = async (
  params?: RoleQueryParams,
): Promise<RoleListResponse> => {
  const response = await api.get<RoleListResponse>("/roles", { params });
  return response.data;
};

/**
 * 2. Lấy chi tiết vai trò theo ID
 */
export const getRoleByIdService = async (
  id: string,
): Promise<RoleDetailResponse> => {
  const response = await api.get<RoleDetailResponse>(`/roles/${id}`);
  return response.data;
};

/**
 * 3. Tạo vai trò mới
 */
export const createRoleService = async (
  payload: CreateRolePayload,
): Promise<RoleDetailResponse> => {
  const response = await api.post<RoleDetailResponse>("/roles", payload);
  return response.data;
};

/**
 * 4. Cập nhật thông tin vai trò (tên, mô tả)
 */
export const updateRoleService = async (
  id: string,
  payload: UpdateRolePayload,
): Promise<RoleDetailResponse> => {
  const response = await api.put<RoleDetailResponse>(`/roles/${id}`, payload);
  return response.data;
};

/**
 * 5. Xóa vai trò tùy chỉnh (chặn xóa system role hoặc role đang có user)
 */
export const deleteRoleService = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/roles/${id}`,
  );
  return response.data;
};

/**
 * 6. Lấy toàn bộ danh mục quyền hệ thống (Permissions)
 */
export const getPermissionsService = async (
  params?: PermissionQueryParams,
): Promise<PermissionListResponse> => {
  const response = await api.get<PermissionListResponse>("/permissions", {
    params,
  });
  return response.data;
};

/**
 * 7. Đồng bộ danh sách quyền cho vai trò
 */
export const syncRolePermissionsService = async (
  roleId: string,
  payload: SyncRolePermissionsPayload,
): Promise<{ success: boolean; data: unknown }> => {
  const response = await api.post<{ success: boolean; data: unknown }>(
    `/roles/${roleId}/permissions`,
    payload,
  );
  return response.data;
};

/**
 * 8. Gán vai trò cho người dùng
 */
export const assignUserRoleService = async (
  userId: string,
  payload: AssignUserRolePayload,
): Promise<{ success: boolean; data: unknown }> => {
  const response = await api.put<{ success: boolean; data: unknown }>(
    `/users/${userId}/role`,
    payload,
  );
  return response.data;
};
