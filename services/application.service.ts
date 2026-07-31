import api from "@/lib/axios";
import {
  ApplicationListResponse,
  ApplicationSuccessResponse,
  ApplicationQueryParams,
  CreateApplicationPayload,
  CreateInvitePayload,
  CreateInviteSuccessResponse,
  ReviewApplicationPayload,
  VerifyInviteSuccessResponse,
  ApplicationInviteListResponse,
  GetApplicationInvitesParams,
  ApplicationInviteRow,
} from "@/types/application";
import { MessageSuccessResponse } from "@/types/auth";

export interface InviteDetailResponse {
  success: boolean;
  data: ApplicationInviteRow;
}

// 1. POST /applications/invites — Send application invite (Admin)
export const createInviteService = async (
  payload: CreateInvitePayload,
): Promise<CreateInviteSuccessResponse> => {
  const response = await api.post<CreateInviteSuccessResponse>(
    "/applications/invites",
    payload,
  );
  return response.data;
};

// 2. GET /applications/invites/verify — Verify token (Public)
export const verifyInviteService = async (
  token: string,
): Promise<VerifyInviteSuccessResponse> => {
  const response = await api.get<VerifyInviteSuccessResponse>(
    "/applications/invites/verify",
    { params: { token } },
  );
  return response.data;
};

// 3. PATCH /applications/invites/:id/revoke — Revoke invite (Admin)
export const revokeInviteService = async (
  id: string,
): Promise<MessageSuccessResponse> => {
  const response = await api.patch<MessageSuccessResponse>(
    `/applications/invites/${id}/revoke`,
  );
  return response.data;
};

// 4. POST /applications — Submit application (Public)
export const createApplicationService = async (
  payload: CreateApplicationPayload,
): Promise<ApplicationSuccessResponse> => {
  const formData = new FormData();
  formData.append("fullName", payload.fullName);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("departmentId", payload.departmentId);
  formData.append("positionId", payload.positionId);
  formData.append("startDate", payload.startDate);
  formData.append("duration", String(payload.duration));
  formData.append("token", payload.token);
  formData.append("regulationId", payload.regulationId);
  formData.append("acceptedRegulations", String(payload.acceptedRegulations));

  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await api.post<ApplicationSuccessResponse>(
    "/applications",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

// 5. GET /applications — List applications (Admin, Leader)
export const getApplicationsService = async (
  params?: ApplicationQueryParams,
): Promise<ApplicationListResponse> => {
  const response = await api.get<ApplicationListResponse>("/applications", {
    params,
  });
  return response.data;
};

// 6. GET /applications/:id — Application details (Admin, Leader)
export const getApplicationService = async (
  id: string,
): Promise<ApplicationSuccessResponse> => {
  const response = await api.get<ApplicationSuccessResponse>(
    `/applications/${id}`,
  );
  return response.data;
};

// 7. PATCH /applications/:id/review — Approve / reject application (Admin, Leader)
export const reviewApplicationService = async (
  id: string,
  payload: ReviewApplicationPayload,
): Promise<ApplicationSuccessResponse> => {
  const response = await api.patch<ApplicationSuccessResponse>(
    `/applications/${id}/review`,
    payload,
  );
  return response.data;
};

// 9. GET /applications/invites — List invites (Admin, Leader)
export const getApplicationInvitesService = async (
  params?: GetApplicationInvitesParams,
): Promise<ApplicationInviteListResponse> => {
  const response = await api.get<ApplicationInviteListResponse>(
    "/applications/invites",
    { params },
  );
  return response.data;
};

// 10. GET /applications/invites/:id — Invite details (Admin, Leader)
export const getInviteByIdService = async (
  id: string,
): Promise<InviteDetailResponse> => {
  const response = await api.get<InviteDetailResponse>(
    `/applications/invites/${id}`,
  );
  return response.data;
};
export const deleteApplicationService = async (
  id: string,
): Promise<MessageSuccessResponse> => {
  const response = await api.delete<MessageSuccessResponse>(
    `/applications/${id}`,
  );
  return response.data;
};
