import api from "@/lib/axios";
import type { ActivityLogQuery, ActivityLogResponse } from "@/types/activity-log";

export const activityLogService = {
  getActivityLogs: async (params?: ActivityLogQuery): Promise<ActivityLogResponse> => {
    const response = await api.get<ActivityLogResponse>("/activity-logs", {
      params,
    });
    return response.data;
  },
};
