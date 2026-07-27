import api from "@/lib/axios";
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
      { headers: { "Content-Type": "multipart/form-data" } },
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
