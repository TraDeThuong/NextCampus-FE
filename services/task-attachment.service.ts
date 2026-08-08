import api from "@/lib/axios";
import { UPLOAD_REQUEST_TIMEOUT_MS } from "@/lib/upload-policy";
import type {
  TaskAttachmentListResponse,
  TaskAttachmentSuccessResponse,
  SubmissionAttachmentListResponse,
  SubmissionAttachmentSuccessResponse,
} from "@/types/task-attachment";
import type { MessageSuccessResponse } from "@/types/auth";

export const taskAttachmentService = {
  // ─── Task Attachments ────────────────────────────────────────────────

  // GET /tasks/:taskId/attachments
  getTaskAttachments: async (
    taskId: string,
  ): Promise<TaskAttachmentListResponse> => {
    const response = await api.get<TaskAttachmentListResponse>(
      `/tasks/${taskId}/attachments`,
    );
    return response.data;
  },

  // POST /tasks/:taskId/attachments
  uploadTaskAttachment: async (
    taskId: string,
    file: File,
  ): Promise<TaskAttachmentSuccessResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<TaskAttachmentSuccessResponse>(
      `/tasks/${taskId}/attachments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // POST /tasks/:taskId/attachments (batch — uploads up to 3 files)
  uploadMultiple: async (
    taskId: string,
    files: File[],
  ): Promise<TaskAttachmentListResponse & { failedCount: number }> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("file", f));
    const response = await api.post<
      TaskAttachmentListResponse & { failedCount: number }
    >(`/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // DELETE /tasks/:taskId/attachments/:attachmentId
  deleteTaskAttachment: async (
    taskId: string,
    attachmentId: string,
  ): Promise<MessageSuccessResponse> => {
    const response = await api.delete<MessageSuccessResponse>(
      `/tasks/${taskId}/attachments/${attachmentId}`,
    );
    return response.data;
  },

  // POST /tasks/:taskId/attachments/link
  createTaskAttachmentLink: async (
    taskId: string,
    fileName: string,
    fileUrl: string,
  ): Promise<TaskAttachmentSuccessResponse> => {
    const response = await api.post<TaskAttachmentSuccessResponse>(
      `/tasks/${taskId}/attachments/link`,
      { fileName, fileUrl },
    );
    return response.data;
  },

  // ─── Submission Attachments ──────────────────────────────────────────

  // GET /task-submissions/:submissionId/attachments
  getSubmissionAttachments: async (
    submissionId: string,
  ): Promise<SubmissionAttachmentListResponse> => {
    const response = await api.get<SubmissionAttachmentListResponse>(
      `/task-submissions/${submissionId}/attachments`,
    );
    return response.data;
  },

  // POST /task-submissions/:submissionId/attachments
  uploadSubmissionAttachment: async (
    submissionId: string,
    file: File,
  ): Promise<SubmissionAttachmentSuccessResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<SubmissionAttachmentSuccessResponse>(
      `/task-submissions/${submissionId}/attachments`,
      formData,
      { timeout: UPLOAD_REQUEST_TIMEOUT_MS },
    );
    return response.data;
  },

  // DELETE /task-submissions/:submissionId/attachments/:attachmentId
  deleteSubmissionAttachment: async (
    submissionId: string,
    attachmentId: string,
  ): Promise<MessageSuccessResponse> => {
    const response = await api.delete<MessageSuccessResponse>(
      `/task-submissions/${submissionId}/attachments/${attachmentId}`,
    );
    return response.data;
  },
};
