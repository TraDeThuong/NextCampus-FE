import api from "@/lib/axios";
import {
  UserListResponse,
  UserSuccessResponse,
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/user";
import { MessageSuccessResponse } from "@/types/auth";

// 1. GET /users — List users (pagination, filter, sort)
export const getUsersService = async (
  params?: UserQueryParams,
): Promise<UserListResponse> => {
  const response = await api.get<UserListResponse>("/users", { params });
  return response.data;
};

// 2. GET /users/:id — User details
export const getUserService = async (id: string): Promise<UserSuccessResponse> => {
  const response = await api.get<UserSuccessResponse>(`/users/${id}`);
  return response.data;
};

// 3. POST /users — Create new user
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

// 5. PUT /users/:id — Update user
export const updateUserService = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<UserSuccessResponse> => {
  const response = await api.put<UserSuccessResponse>(`/users/${id}`, payload);
  return response.data;
};

// 6. DELETE /users/:id — Soft delete user
export const deleteUserService = async (id: string): Promise<UserSuccessResponse> => {
  const response = await api.delete<UserSuccessResponse>(`/users/${id}`);
  return response.data;
};

// 7. PATCH /users/change-password — Change password
// export const changePasswordService = async (
//   payload: ChangePasswordPayload,
// ): Promise<MessageSuccessResponse> => {
//   const response = await api.patch<MessageSuccessResponse>(
//     "/users/change-password",
//     payload,
//   );
//   return response.data;
// };
