import api from "@/lib/axios";
import type {
  NotificationListResponse,
  NotificationSuccessResponse,
  NotificationQueryParams,
  CreateNotificationPayload,
} from "@/types/notification";
import type { MessageSuccessResponse } from "@/types/auth";

export const notificationService = {
  getNotifications: async (
    params?: NotificationQueryParams,
  ): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>("/notifications", {
      params,
    });
    return response.data;
  },

  getNotification: async (
    id: string,
  ): Promise<NotificationSuccessResponse> => {
    const response = await api.get<NotificationSuccessResponse>(
      `/notifications/${id}`,
    );
    return response.data;
  },

  createNotification: async (
    payload: CreateNotificationPayload,
  ): Promise<NotificationSuccessResponse> => {
    const response = await api.post<NotificationSuccessResponse>(
      "/notifications",
      payload,
    );
    return response.data;
  },

  getTicket: async (): Promise<{ success: boolean; ticket: string }> => {
    const response = await api.get<{ success: boolean; ticket: string }>(
      "/notifications/ticket",
    );
    return response.data;
  },

  markAsRead: async (id: string): Promise<NotificationSuccessResponse> => {
    const response = await api.patch<NotificationSuccessResponse>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  markAllAsRead: async (): Promise<MessageSuccessResponse> => {
    const response = await api.patch<MessageSuccessResponse>(
      "/notifications/read-all",
    );
    return response.data;
  },

  deleteNotification: async (id: string): Promise<MessageSuccessResponse> => {
    const response = await api.delete<MessageSuccessResponse>(
      `/notifications/${id}`,
    );
    return response.data;
  },

  sendCustomNotification: async (payload: {
    email: string;
    title: string;
    content: string;
    emailSubject?: string;
    emailContent?: string;
    sendWeb?: boolean;
    sendEmail?: boolean;
  }): Promise<any> => {
    const response = await api.post("/notifications/send-custom", payload);
    return response.data;
  },
};
