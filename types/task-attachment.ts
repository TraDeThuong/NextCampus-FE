// ─── Entities ──────────────────────────────────────────────────────────────

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

export interface SubmissionAttachment {
  id: string;
  submissionId: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

// ─── Response wrappers ────────────────────────────────────────────────────

export interface TaskAttachmentListResponse {
  success: boolean;
  data: TaskAttachment[];
}

export interface TaskAttachmentSuccessResponse {
  success: boolean;
  data: TaskAttachment;
}

export interface SubmissionAttachmentListResponse {
  success: boolean;
  data: SubmissionAttachment[];
}

export interface SubmissionAttachmentSuccessResponse {
  success: boolean;
  data: SubmissionAttachment;
}
