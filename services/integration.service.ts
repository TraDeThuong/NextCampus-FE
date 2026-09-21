import api from "@/lib/axios";
import type {
  ApiKeyListResponse,
  CreateApiKeyPayload,
  CreateApiKeyResponse,
  WebhookListResponse,
  WebhookItem,
  CreateWebhookPayload,
  UpdateWebhookPayload,
  WebhookDeliveriesResponse,
  WebhookDeliveriesQuery,
} from "@/types/integration";

export const integrationService = {
  // ── API Key Handlers ───────────────────────────────────────────────────────
  listApiKeys: async (): Promise<ApiKeyListResponse> => {
    const response = await api.get<ApiKeyListResponse>("/integrations/api-keys");
    return response.data;
  },

  createApiKey: async (
    payload: CreateApiKeyPayload
  ): Promise<CreateApiKeyResponse> => {
    const response = await api.post<CreateApiKeyResponse>(
      "/integrations/api-keys",
      payload
    );
    return response.data;
  },

  deleteApiKey: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/integrations/api-keys/${id}`
    );
    return response.data;
  },

  toggleApiKey: async (
    id: string,
    isActive: boolean
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/integrations/api-keys/${id}/toggle`,
      { isActive }
    );
    return response.data;
  },

  // ── Webhook Handlers ───────────────────────────────────────────────────────
  listWebhooks: async (): Promise<WebhookListResponse> => {
    const response = await api.get<WebhookListResponse>("/integrations/webhooks");
    return response.data;
  },

  getWebhookById: async (
    id: string
  ): Promise<{ success: boolean; data: WebhookItem }> => {
    const response = await api.get<{ success: boolean; data: WebhookItem }>(
      `/integrations/webhooks/${id}`
    );
    return response.data;
  },

  createWebhook: async (
    payload: CreateWebhookPayload
  ): Promise<{ success: boolean; data: WebhookItem; message: string }> => {
    const response = await api.post<{
      success: boolean;
      data: WebhookItem;
      message: string;
    }>("/integrations/webhooks", payload);
    return response.data;
  },

  updateWebhook: async (
    id: string,
    payload: UpdateWebhookPayload
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put<{ success: boolean; message: string }>(
      `/integrations/webhooks/${id}`,
      payload
    );
    return response.data;
  },

  deleteWebhook: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/integrations/webhooks/${id}`
    );
    return response.data;
  },

  testPingWebhook: async (
    id: string
  ): Promise<{ success: boolean; data: { deliveryId: string; message: string } }> => {
    const response = await api.post<{
      success: boolean;
      data: { deliveryId: string; message: string };
    }>(`/integrations/webhooks/${id}/test`);
    return response.data;
  },

  listDeliveries: async (
    webhookId: string,
    query?: WebhookDeliveriesQuery
  ): Promise<WebhookDeliveriesResponse> => {
    const response = await api.get<WebhookDeliveriesResponse>(
      `/integrations/webhooks/${webhookId}/deliveries`,
      { params: query }
    );
    return response.data;
  },

  retryDelivery: async (
    deliveryId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/integrations/webhooks/deliveries/${deliveryId}/retry`
    );
    return response.data;
  },
};
