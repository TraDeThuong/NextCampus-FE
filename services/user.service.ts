import api from "@/lib/axios";
import {
  UserListResponse,
  UserSuccessResponse,
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
} from "@/types/user";
import { MessageSuccessResponse } from "@/types/auth";

// 1. GET /users — Danh sách user (phân trang, filter, sort)
export const getUsersService = async (
  params?: UserQueryParams,
): Promise<UserListResponse> => {
  const response = await api.get<UserListResponse>("/users", { params });
  return response.data;
};

// 2. GET /users/:id — Chi tiết user
export const getUserService = async (id: string): Promise<UserSuccessResponse> => {
  const response = await api.get<UserSuccessResponse>(`/users/${id}`);
  return response.data;
};

// 3. POST /users — Tạo user mới
export const createUserService = async (payload: CreateUserPayload) => {
  const response = await api.post("/users", payload);
  return response.data;
};

// 4. POST /users/avatar — Upload avatar
export const uploadAvatarService = async (file: File): Promise<UserSuccessResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await api.post<UserSuccessResponse>("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 5. PUT /users/:id — Cập nhật user
export const updateUserService = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<UserSuccessResponse> => {
  const response = await api.put<UserSuccessResponse>(`/users/${id}`, payload);
  return response.data;
};

// 6. DELETE /users/:id — Xoá mềm user
export const deleteUserService = async (id: string): Promise<UserSuccessResponse> => {
  const response = await api.delete<UserSuccessResponse>(`/users/${id}`);
  return response.data;
};

// 7. PATCH /users/change-password — Đổi mật khẩu
export const changePasswordService = async (
  payload: ChangePasswordPayload,
): Promise<MessageSuccessResponse> => {
  const response = await api.patch<MessageSuccessResponse>(
    "/users/change-password",
    payload,
  );
  return response.data;
};
