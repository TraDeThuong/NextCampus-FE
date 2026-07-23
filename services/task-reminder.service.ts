import api from "@/lib/axios";
import type { MessageSuccessResponse } from "@/types/auth";

export const taskReminderService = {
  // POST /notifications/remind/tasks
  triggerTaskReminders: async (): Promise<MessageSuccessResponse> => {
    const response = await api.post<MessageSuccessResponse>(
      "/notifications/remind/tasks",
    );
    return response.data;
  },
};
