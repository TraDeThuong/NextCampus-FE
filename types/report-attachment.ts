// ─── Entity ──────────────────────────────────────────────────────────────────

export interface ReportAttachment {
  id: string;
  reportId: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

// ─── Response wrappers ──────────────────────────────────────────────────────

export interface ReportAttachmentListResponse {
  success: boolean;
  data: ReportAttachment[];
}

export interface ReportAttachmentSuccessResponse {
  success: boolean;
  data: ReportAttachment;
}
