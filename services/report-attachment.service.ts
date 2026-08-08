import api from "@/lib/axios";
import { UPLOAD_REQUEST_TIMEOUT_MS } from "@/lib/upload-policy";
import type {
  ReportAttachmentListResponse,
  ReportAttachmentSuccessResponse,
} from "@/types/report-attachment";
import type { MessageSuccessResponse } from "@/types/auth";

export const reportAttachmentService = {
  // GET /daily-reports/:reportId/attachments
  getReportAttachments: async (
    reportId: string,
  ): Promise<ReportAttachmentListResponse> => {
    const response = await api.get<ReportAttachmentListResponse>(
      `/daily-reports/${reportId}/attachments`,
    );
    return response.data;
  },

  // POST /daily-reports/:reportId/attachments
  uploadReportAttachment: async (
    reportId: string,
    file: File,
  ): Promise<ReportAttachmentSuccessResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ReportAttachmentSuccessResponse>(
      `/daily-reports/${reportId}/attachments`,
      formData,
      { timeout: UPLOAD_REQUEST_TIMEOUT_MS },
    );
    return response.data;
  },

  getReportAttachmentPutUrl: async (
    reportId: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ): Promise<{ success: boolean; data: { uploadUrl: string; filePath: string; publicUrl: string } }> => {
    const response = await api.get(
      `/daily-reports/${reportId}/attachments/upload-url`,
      { params: { fileName, mimeType, fileSize } },
    );
    return response.data;
  },

  confirmReportAttachmentUpload: async (
    reportId: string,
    filePath: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ): Promise<ReportAttachmentSuccessResponse> => {
    const response = await api.post<ReportAttachmentSuccessResponse>(
      `/daily-reports/${reportId}/attachments/confirm`,
      { filePath, fileName, mimeType, fileSize },
    );
    return response.data;
  },

  // DELETE /daily-reports/:reportId/attachments/:attachmentId
  deleteReportAttachment: async (
    reportId: string,
    attachmentId: string,
  ): Promise<MessageSuccessResponse> => {
    const response = await api.delete<MessageSuccessResponse>(
      `/daily-reports/${reportId}/attachments/${attachmentId}`,
    );
    return response.data;
  },
};
