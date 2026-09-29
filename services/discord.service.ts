import api from "@/lib/axios";
import type {
  CreateDiscordWebhookPayload,
  DiscordBotStatus,
  DiscordBotStatusResponse,
  DiscordWebhookItem,
  DiscordWebhookListResponse,
  ProvisionAllDepartmentsResponse,
  ProvisionDepartmentResponse,
  TestDiscordWebhookPayload,
  TestDiscordWebhookResponse,
  UpdateDiscordWebhookPayload,
} from "@/types/discord";

export const discordService = {
  listWebhooks: async (params?: Record<string, unknown>): Promise<DiscordWebhookItem[]> => {
    const res = await api.get<DiscordWebhookListResponse>("/integrations/discord/webhooks", {
      params,
    });
    return res.data.data;
  },

  getWebhookById: async (id: string): Promise<DiscordWebhookItem> => {
    const res = await api.get<{ success: boolean; data: DiscordWebhookItem }>(
      `/integrations/discord/webhooks/${id}`,
    );
    return res.data.data;
  },

  createWebhook: async (
    payload: CreateDiscordWebhookPayload,
  ): Promise<{ success: boolean; message: string; data: DiscordWebhookItem }> => {
    const res = await api.post<{
      success: boolean;
      message: string;
      data: DiscordWebhookItem;
    }>("/integrations/discord/webhooks", payload);
    return res.data;
  },

  updateWebhook: async (
    id: string,
    payload: UpdateDiscordWebhookPayload,
  ): Promise<{ success: boolean; message: string; data: DiscordWebhookItem }> => {
    const res = await api.put<{
      success: boolean;
      message: string;
      data: DiscordWebhookItem;
    }>(`/integrations/discord/webhooks/${id}`, payload);
    return res.data;
  },

  deleteWebhook: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/integrations/discord/webhooks/${id}`,
    );
    return res.data;
  },

  testPingWebhook: async (
    payload: TestDiscordWebhookPayload,
  ): Promise<TestDiscordWebhookResponse> => {
    const res = await api.post<TestDiscordWebhookResponse>(
      "/integrations/discord/webhooks/test",
      payload,
    );
    return res.data;
  },

  getBotStatus: async (): Promise<DiscordBotStatus> => {
    const res = await api.get<DiscordBotStatusResponse>(
      "/integrations/discord/status",
    );
    return res.data.data;
  },

  provisionDepartment: async (
    departmentId: string,
  ): Promise<ProvisionDepartmentResponse> => {
    const res = await api.post<ProvisionDepartmentResponse>(
      `/integrations/discord/departments/${departmentId}/provision`,
    );
    return res.data;
  },

  provisionAllDepartments: async (): Promise<ProvisionAllDepartmentsResponse> => {
    const res = await api.post<ProvisionAllDepartmentsResponse>(
      "/integrations/discord/departments/provision-all",
    );
    return res.data;
  },
};
