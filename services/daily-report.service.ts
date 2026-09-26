import api from "@/lib/axios";
import { UPLOAD_REQUEST_TIMEOUT_MS } from "@/lib/upload-policy";
import type {
  DailyReport,
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
    const response = await api.get<Record<string, unknown>>("/daily-reports", {
      params,
    });
    const resData = response.data || {};
    const rawItems = (
      Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.items)
          ? resData.items
          : []
    ) as DailyReport[];

    const metaObj = (
      resData.meta && typeof resData.meta === "object" ? resData.meta : {}
    ) as Record<string, unknown>;

    const total = Number(resData.total ?? metaObj.total ?? rawItems.length);
    const page = Number(resData.page ?? metaObj.page ?? (params?.page || 1));
    const limit = Number(resData.limit ?? metaObj.limit ?? (params?.limit || 20));
    const totalPages = Number(
      resData.totalPages ??
        metaObj.totalPages ??
        Math.max(1, Math.ceil(total / Math.max(1, limit))),
    );

    return {
      success: resData.success !== false,
      data: rawItems,
      items: rawItems,
      total,
      page,
      limit,
      totalPages,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
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

  // POST /daily-reports/upload-url (Cloudflare R2 presigned PUT url for reports/)
  getUploadUrl: async (input: {
    fileName: string;
    mimeType: string;
  }): Promise<{ success: boolean; data: { uploadUrl: string; fileUrl: string; filePath: string } }> => {
    const response = await api.post("/daily-reports/upload-url", input);
    return response.data;
  },

  // GET /daily-reports/calendar
  getCalendar: async (params: {
    month: number;
    year: number;
    internId?: string;
  }): Promise<{
    success: boolean;
    data: {
      internId: string;
      month: number;
      year: number;
      totalWorkingDays: number;
      reportedDays: number;
      missingDays: number;
      submissionRate: number;
      days: Array<{
        date: string;
        dayOfWeek: number;
        status: "REPORTED" | "MISSING" | "FUTURE" | "WEEKEND" | "OUT_OF_RANGE";
        reportId?: string;
        hoursWorked?: number;
        hasFeedback?: boolean;
      }>;
    };
  }> => {
    const response = await api.get("/daily-reports/calendar", { params });
    return response.data;
  },

  // POST /daily-reports/:id/feedback
  addFeedback: async (
    id: string,
    feedback: string,
  ): Promise<DailyReportSuccessResponse> => {
    const response = await api.post<DailyReportSuccessResponse>(
      `/daily-reports/${id}/feedback`,
      { feedback },
    );
    return response.data;
  },

  // DELETE /daily-reports/attachments/:attachmentId
  deleteAttachment: async (
    attachmentId: string,
  ): Promise<MessageSuccessResponse> => {
    const response = await api.delete<MessageSuccessResponse>(
      `/daily-reports/attachments/${attachmentId}`,
    );
    return response.data;
  },
};
