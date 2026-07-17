import api from "@/lib/axios";
import type {
  NotificationTemplateListResponse,
  NotificationTemplateSuccessResponse,
  UpsertNotificationTemplatePayload,
} from "@/types/notificationTemplate";

export const notificationTemplateService = {
  getAll: async (): Promise<NotificationTemplateListResponse> => {
    const response =
      await api.get<NotificationTemplateListResponse>(
        "/notification-templates",
      );
    return response.data;
  },

  upsertByType: async (
    type: string,
    payload: UpsertNotificationTemplatePayload,
  ): Promise<NotificationTemplateSuccessResponse> => {
    const response = await api.put<NotificationTemplateSuccessResponse>(
      `/notification-templates/type/${type}`,
      payload,
    );
    return response.data;
  },

  reset: async (id: string): Promise<NotificationTemplateSuccessResponse> => {
    const response = await api.post<NotificationTemplateSuccessResponse>(
      `/notification-templates/${id}/reset`,
    );
    return response.data;
  },
};
