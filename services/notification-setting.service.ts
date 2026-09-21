import api from "@/lib/axios";
import type {
  NotificationSettingResponse,
  UpdateNotificationSettingPayload,
} from "@/types/notification-setting";

export const notificationSettingService = {
  getSettings: async (): Promise<NotificationSettingResponse> => {
    const response = await api.get<NotificationSettingResponse>("/notification-settings");
    return response.data;
  },

  updateSettings: async (
    payload: UpdateNotificationSettingPayload,
  ): Promise<NotificationSettingResponse> => {
    const response = await api.put<NotificationSettingResponse>(
      "/notification-settings",
      payload,
    );
    return response.data;
  },
};
