import api from "@/lib/axios";
import type {
  TaskAssignmentListResponse,
  TaskAssignmentSuccessResponse,
  TaskAssignmentDeleteResponse,
  TaskAssignmentQueryParams,
  CreateTaskAssignmentPayload,
  AssignTaskPayload,
  UpdateTaskAssignmentPayload,
  RequestExtensionPayload,
  RejectExtensionPayload,
  TaskExtensionRequestResponse,
  TaskExtensionRequestListResponse,
  TaskAssignmentExtensionRequestsResponse,
  TaskExtensionRequestQueryParams,
} from "@/types/task-assignment";

export const taskAssignmentService = {
  // GET /task-assignments
  getAssignments: async (
    params?: TaskAssignmentQueryParams,
  ): Promise<TaskAssignmentListResponse> => {
    const response = await api.get<TaskAssignmentListResponse>(
      "/task-assignments",
      { params },
    );
    return response.data;
  },

  // GET /task-assignments/:id
  getAssignment: async (
    id: string,
  ): Promise<TaskAssignmentSuccessResponse> => {
    const response = await api.get<TaskAssignmentSuccessResponse>(
      `/task-assignments/${id}`,
    );
    return response.data;
  },

  // POST /task-assignments
  createAssignment: async (
    payload: CreateTaskAssignmentPayload,
  ): Promise<TaskAssignmentSuccessResponse> => {
    const response = await api.post<TaskAssignmentSuccessResponse>(
      "/task-assignments",
      payload,
    );
    return response.data;
  },

  // PUT /task-assignments/task/:taskId
  assignTask: async (
    taskId: string,
    payload: AssignTaskPayload,
  ): Promise<TaskAssignmentSuccessResponse> => {
    const response = await api.put<TaskAssignmentSuccessResponse>(
      `/task-assignments/task/${taskId}`,
      payload,
    );
    return response.data;
  },

  // DELETE /task-assignments/task/:taskId
  unassignTask: async (taskId: string): Promise<TaskAssignmentDeleteResponse> => {
    const response = await api.delete<TaskAssignmentDeleteResponse>(
      `/task-assignments/task/${taskId}`,
    );
    return response.data;
  },

  // PUT /task-assignments/:id
  updateAssignment: async (
    id: string,
    payload: UpdateTaskAssignmentPayload,
  ): Promise<TaskAssignmentSuccessResponse> => {
    const response = await api.put<TaskAssignmentSuccessResponse>(
      `/task-assignments/${id}`,
      payload,
    );
    return response.data;
  },

  // PATCH /task-assignments/:id/approve
  approveAssignment: async (
    id: string,
  ): Promise<TaskAssignmentSuccessResponse> => {
    const response = await api.patch<TaskAssignmentSuccessResponse>(
      `/task-assignments/${id}/approve`,
    );
    return response.data;
  },

  // PATCH /task-assignments/:id/reject
  rejectAssignment: async (
    id: string,
    reason?: string,
  ): Promise<TaskAssignmentDeleteResponse> => {
    const response = await api.patch<TaskAssignmentDeleteResponse>(
      `/task-assignments/${id}/reject`,
      { reason: reason || "" },
    );
    return response.data;
  },

  // POST /task-assignments/:id/start
  startTask: async (
    id: string,
  ): Promise<TaskAssignmentSuccessResponse> => {
    const response = await api.post<TaskAssignmentSuccessResponse>(
      `/task-assignments/${id}/start`,
    );
    return response.data;
  },

  // POST /task-assignments/:id/block
  blockTask: async (
    id: string,
    blockedReason: string,
  ): Promise<TaskAssignmentSuccessResponse> => {
    const response = await api.post<TaskAssignmentSuccessResponse>(
      `/task-assignments/${id}/block`,
      { blockedReason },
    );
    return response.data;
  },

  // POST /task-assignments/:id/unblock
  unblockTask: async (
    id: string,
  ): Promise<TaskAssignmentSuccessResponse> => {
    const response = await api.post<TaskAssignmentSuccessResponse>(
      `/task-assignments/${id}/unblock`,
    );
    return response.data;
  },

  // DELETE /task-assignments/:id
  deleteAssignment: async (
    id: string,
  ): Promise<TaskAssignmentDeleteResponse> => {
    const response = await api.delete<TaskAssignmentDeleteResponse>(
      `/task-assignments/${id}`,
    );
    return response.data;
  },

  // ─── Extension Requests (Workflow gia hạn deadline) ──────────────────────

  // POST /task-assignments/:id/request-extension (Intern xin gia hạn)
  requestExtension: async (
    id: string,
    payload: RequestExtensionPayload,
  ): Promise<TaskExtensionRequestResponse> => {
    const response = await api.post<TaskExtensionRequestResponse>(
      `/task-assignments/${id}/request-extension`,
      payload,
    );
    return response.data;
  },

  // GET /task-assignments/extension-requests (Leader danh sách yêu cầu)
  getExtensionRequests: async (
    params?: TaskExtensionRequestQueryParams,
  ): Promise<TaskExtensionRequestListResponse> => {
    const response = await api.get<TaskExtensionRequestListResponse>(
      "/task-assignments/extension-requests",
      { params },
    );
    return response.data;
  },

  // GET /task-assignments/:id/extension-requests (Lịch sử gia hạn của assignment)
  getExtensionRequestsByAssignment: async (
    id: string,
  ): Promise<TaskAssignmentExtensionRequestsResponse> => {
    const response = await api.get<TaskAssignmentExtensionRequestsResponse>(
      `/task-assignments/${id}/extension-requests`,
    );
    return response.data;
  },

  // POST /task-assignments/extension-requests/:requestId/approve (Leader duyệt)
  approveExtension: async (
    requestId: string,
  ): Promise<TaskExtensionRequestResponse> => {
    const response = await api.post<TaskExtensionRequestResponse>(
      `/task-assignments/extension-requests/${requestId}/approve`,
    );
    return response.data;
  },

  // POST /task-assignments/extension-requests/:requestId/reject (Leader từ chối)
  rejectExtension: async (
    requestId: string,
    payload: RejectExtensionPayload,
  ): Promise<TaskExtensionRequestResponse> => {
    const response = await api.post<TaskExtensionRequestResponse>(
      `/task-assignments/extension-requests/${requestId}/reject`,
      payload,
    );
    return response.data;
  },
};
