import api from "@/lib/axios";
import { UPLOAD_REQUEST_TIMEOUT_MS } from "@/lib/upload-policy";
import type {
  DailyReportListResponse,
  DailyReportSuccessResponse,
  DailyReportQueryParams,
  CreateDailyReportPayload,
  UpdateDailyReportPayload,
} from "@/types/daily-report";
import type { MessageSuccessResponse } from "@/types/auth";

export const dailyReportService = {
  // GET /daily-reports
  getDailyReports: async (
    params?: DailyReportQueryParams,
  ): Promise<DailyReportListResponse> => {
    const response = await api.get<DailyReportListResponse>("/daily-reports", {
      params,
    });
    return response.data;
  },

  // GET /daily-reports/:id
  getDailyReport: async (
    id: string,
  ): Promise<DailyReportSuccessResponse> => {
    const response = await api.get<DailyReportSuccessResponse>(
      `/daily-reports/${id}`,
    );
    return response.data;
  },

  // POST /daily-reports
  createDailyReport: async (
    payload: CreateDailyReportPayload,
  ): Promise<DailyReportSuccessResponse> => {
    const response = await api.post<DailyReportSuccessResponse>(
      "/daily-reports",
      payload,
    );
    return response.data;
  },

  // PUT /daily-reports/:id
  updateDailyReport: async (
    id: string,
    payload: UpdateDailyReportPayload,
  ): Promise<DailyReportSuccessResponse> => {
    const response = await api.put<DailyReportSuccessResponse>(
      `/daily-reports/${id}`,
      payload,
    );
    return response.data;
  },

  // POST /daily-reports/:id/video
  uploadVideoDemo: async (
    id: string,
    file: File,
  ): Promise<DailyReportSuccessResponse> => {
    const formData = new FormData();
    formData.append("video", file);
    const response = await api.post<DailyReportSuccessResponse>(
      `/daily-reports/${id}/video`,
      formData,
      { timeout: UPLOAD_REQUEST_TIMEOUT_MS },
    );
    return response.data;
  },

  getVideoPutUrl: async (
    id: string,
    mimeType: string,
  ): Promise<{ success: boolean; data: { uploadUrl: string; filePath: string; publicUrl: string } }> => {
    const response = await api.get(`/daily-reports/${id}/video/upload-url`, {
      params: { mimeType },
    });
    return response.data;
  },

  confirmVideoUpload: async (
    id: string,
    filePath: string,
  ): Promise<DailyReportSuccessResponse> => {
    const response = await api.post<DailyReportSuccessResponse>(
      `/daily-reports/${id}/video/confirm`,
      { filePath },
    );
    return response.data;
  },

  // DELETE /daily-reports/:id
  deleteDailyReport: async (
    id: string,
  ): Promise<MessageSuccessResponse> => {
    const response = await api.delete<MessageSuccessResponse>(
      `/daily-reports/${id}`,
    );
    return response.data;
  },
};
