import api from "@/lib/axios";
import { UPLOAD_REQUEST_TIMEOUT_MS } from "@/lib/upload-policy";
import type {
  TaskSubmissionListResponse,
  TaskSubmissionSuccessResponse,
  TaskSubmissionDeleteResponse,
  TaskSubmissionThreadResponse,
  TaskSubmissionQueryParams,
  CreateTaskSubmissionPayload,
  UpdateTaskSubmissionPayload,
} from "@/types/task-submission";

export const taskSubmissionService = {
  // GET /task-submissions
  getSubmissions: async (
    params?: TaskSubmissionQueryParams,
  ): Promise<TaskSubmissionListResponse> => {
    const response = await api.get<TaskSubmissionListResponse>(
      "/task-submissions",
      { params },
    );
    return response.data;
  },

  // GET /task-submissions/thread/:assignmentId
  getSubmissionThread: async (
    assignmentId: string,
  ): Promise<TaskSubmissionThreadResponse> => {
    const response = await api.get<TaskSubmissionThreadResponse>(
      `/task-submissions/thread/${assignmentId}`,
    );
    return response.data;
  },

  // GET /task-submissions/:id
  getSubmission: async (
    id: string,
  ): Promise<TaskSubmissionSuccessResponse> => {
    const response = await api.get<TaskSubmissionSuccessResponse>(
      `/task-submissions/${id}`,
    );
    return response.data;
  },

  // POST /task-submissions
  createSubmission: async (
    payload: CreateTaskSubmissionPayload,
  ): Promise<TaskSubmissionSuccessResponse> => {
    const response = await api.post<TaskSubmissionSuccessResponse>(
      "/task-submissions",
      payload,
    );
    return response.data;
  },

  // PUT /task-submissions/:id
  updateSubmission: async (
    id: string,
    payload: UpdateTaskSubmissionPayload,
  ): Promise<TaskSubmissionSuccessResponse> => {
    const response = await api.put<TaskSubmissionSuccessResponse>(
      `/task-submissions/${id}`,
      payload,
    );
    return response.data;
  },

  // POST /task-submissions/:id/video (legacy - multipart qua server)
  uploadVideo: async (
    id: string,
    file: File,
  ): Promise<TaskSubmissionSuccessResponse> => {
    const formData = new FormData();
    formData.append("video", file);
    const response = await api.post<TaskSubmissionSuccessResponse>(
      `/task-submissions/${id}/video`,
      formData,
      { timeout: UPLOAD_REQUEST_TIMEOUT_MS },
    );
    return response.data;
  },

  // GET /task-submissions/:id/video/upload-url
  getVideoPutUrl: async (
    id: string,
    mimeType: string,
  ): Promise<{ success: true; data: { uploadUrl: string; filePath: string; publicUrl: string } }> => {
    const response = await api.get(
      `/task-submissions/${id}/video/upload-url`,
      { params: { mimeType } },
    );
    return response.data;
  },

  // POST /task-submissions/:id/video/confirm
  confirmVideoUpload: async (
    id: string,
    filePath: string,
  ): Promise<TaskSubmissionSuccessResponse> => {
    const response = await api.post<TaskSubmissionSuccessResponse>(
      `/task-submissions/${id}/video/confirm`,
      { filePath },
    );
    return response.data;
  },

  // DELETE /task-submissions/:id
  deleteSubmission: async (
    id: string,
  ): Promise<TaskSubmissionDeleteResponse> => {
    const response = await api.delete<TaskSubmissionDeleteResponse>(
      `/task-submissions/${id}`,
    );
    return response.data;
  },
};
