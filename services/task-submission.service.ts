import api from "@/lib/axios";
import type {
  TaskSubmissionListResponse,
  TaskSubmissionSuccessResponse,
  TaskSubmissionDeleteResponse,
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

  // POST /task-submissions/:id/video
  uploadVideo: async (
    id: string,
    file: File,
  ): Promise<TaskSubmissionSuccessResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<TaskSubmissionSuccessResponse>(
      `/task-submissions/${id}/video`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
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
