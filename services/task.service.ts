import api from "@/lib/axios";
import type {
  TaskListResponse,
  TaskSuccessResponse,
  TaskDeleteResponse,
  TaskQueryParams,
  CreateTaskPayload,
  UpdateTaskPayload,
  ImportPreviewResponse,
  ImportResultResponse,
  TaskAnalyticsResponse,
} from "@/types/task";

export const taskService = {
  // ─── CRUD ────────────────────────────────────────────────────────────

  // GET /tasks
  getTasks: async (params?: TaskQueryParams): Promise<TaskListResponse> => {
    const response = await api.get<TaskListResponse>("/tasks", { params });
    return response.data;
  },

  // GET /tasks/:id
  getTask: async (id: string): Promise<TaskSuccessResponse> => {
    const response = await api.get<TaskSuccessResponse>(`/tasks/${id}`);
    return response.data;
  },

  // POST /tasks
  createTask: async (payload: CreateTaskPayload): Promise<TaskSuccessResponse> => {
    const response = await api.post<TaskSuccessResponse>("/tasks", payload);
    return response.data;
  },

  // PUT /tasks/:id
  updateTask: async (
    id: string,
    payload: UpdateTaskPayload,
  ): Promise<TaskSuccessResponse> => {
    const response = await api.put<TaskSuccessResponse>(`/tasks/${id}`, payload);
    return response.data;
  },

  // DELETE /tasks/:id
  deleteTask: async (id: string): Promise<TaskDeleteResponse> => {
    const response = await api.delete<TaskDeleteResponse>(`/tasks/${id}`);
    return response.data;
  },

  // ─── Import ──────────────────────────────────────────────────────────

  // POST /tasks/import/preview
  previewImport: async (
    file: File,
    taskGroupId?: string,
    taskGroupName?: string,
  ): Promise<ImportPreviewResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (taskGroupId) formData.append("taskGroupId", taskGroupId);
    if (taskGroupName) formData.append("taskGroupName", taskGroupName);
    const response = await api.post<ImportPreviewResponse>(
      "/tasks/import/preview",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // POST /tasks/import
  executeImport: async (
    file: File,
    taskGroupId?: string,
    taskGroupName?: string,
  ): Promise<ImportResultResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (taskGroupId) formData.append("taskGroupId", taskGroupId);
    if (taskGroupName) formData.append("taskGroupName", taskGroupName);
    const response = await api.post<ImportResultResponse>(
      "/tasks/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // GET /tasks/import/template
  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get("/tasks/import/template", {
      responseType: "blob",
    });
    return response.data;
  },

  // ─── Analytics ───────────────────────────────────────────────────────

  // GET /tasks/analytics
  getAnalytics: async (
    taskGroupId?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<TaskAnalyticsResponse> => {
    const params: Record<string, string> = {};
    if (taskGroupId) params.taskGroupId = taskGroupId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const response = await api.get<TaskAnalyticsResponse>("/tasks/analytics", {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  },

  // ─── AI Recommendation ──────────────────────────────────────────────

  // POST /tasks/:taskId/ai-recommendation
  getAiRecommendation: async (taskId: string) => {
    const response = await api.post(`/tasks/${taskId}/ai-recommendation`);
    return response.data;
  },
};
