import api from "@/lib/axios";
import type {
  TaskAssignmentListResponse,
  TaskAssignmentSuccessResponse,
  TaskAssignmentDeleteResponse,
  TaskAssignmentQueryParams,
  CreateTaskAssignmentPayload,
  UpdateTaskAssignmentPayload,
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
  ): Promise<TaskAssignmentDeleteResponse> => {
    const response = await api.patch<TaskAssignmentDeleteResponse>(
      `/task-assignments/${id}/reject`,
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
};
