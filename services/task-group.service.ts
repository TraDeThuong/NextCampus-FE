import api from "@/lib/axios";
import type {
  TaskGroupListResponse,
  TaskGroupSuccessResponse,
  TaskGroupProgressResponse,
  TaskGroupTasksResponse,
  CreateTaskGroupPayload,
  UpdateTaskGroupPayload,
  TaskGroupQueryParams,
} from "@/types/task-group";
import type {
  GroupAiRecommendationResponse,
  ConfirmGroupAllocationPayload,
  ConfirmGroupAllocationResponse,
} from "@/types/task-allocation";
import type { MessageSuccessResponse } from "@/types/auth";

export const taskGroupService = {
  // GET /task-groups
  getAll: async (params?: TaskGroupQueryParams): Promise<TaskGroupListResponse> => {
    const response = await api.get<TaskGroupListResponse>("/task-groups", { params });
    return response.data;
  },

  // GET /task-groups/:id
  getById: async (id: string): Promise<TaskGroupSuccessResponse> => {
    const response = await api.get<TaskGroupSuccessResponse>(
      `/task-groups/${id}`,
    );
    return response.data;
  },

  // GET /task-groups/:id/progress
  getProgress: async (id: string): Promise<TaskGroupProgressResponse> => {
    const response = await api.get<TaskGroupProgressResponse>(
      `/task-groups/${id}/progress`,
    );
    return response.data;
  },

  // GET /task-groups/:id/tasks
  getTasks: async (id: string): Promise<TaskGroupTasksResponse> => {
    const response = await api.get<TaskGroupTasksResponse>(
      `/task-groups/${id}/tasks`,
    );
    return response.data;
  },

  // POST /task-groups
  create: async (
    payload: CreateTaskGroupPayload,
  ): Promise<TaskGroupSuccessResponse> => {
    const response = await api.post<TaskGroupSuccessResponse>(
      "/task-groups",
      payload,
    );
    return response.data;
  },

  // PUT /task-groups/:id
  update: async (
    id: string,
    payload: UpdateTaskGroupPayload,
  ): Promise<TaskGroupSuccessResponse> => {
    const response = await api.put<TaskGroupSuccessResponse>(
      `/task-groups/${id}`,
      payload,
    );
    return response.data;
  },

  // DELETE /task-groups/:id
  delete: async (id: string): Promise<MessageSuccessResponse> => {
    const response = await api.delete<MessageSuccessResponse>(
      `/task-groups/${id}`,
    );
    return response.data;
  },

  // POST /task-groups/:id/ai-recommendation
  getGroupAiRecommendation: async (id: string): Promise<GroupAiRecommendationResponse> => {
    const response = await api.post<GroupAiRecommendationResponse>(
      `/task-groups/${id}/ai-recommendation`,
    );
    return response.data;
  },

  // POST /task-groups/:id/ai-allocation/confirm
  confirmGroupAiAllocation: async (
    id: string,
    payload: ConfirmGroupAllocationPayload,
  ): Promise<ConfirmGroupAllocationResponse> => {
    const response = await api.post<ConfirmGroupAllocationResponse>(
      `/task-groups/${id}/ai-allocation/confirm`,
      payload,
    );
    return response.data;
  },
};
