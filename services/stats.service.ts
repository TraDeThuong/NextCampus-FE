import api from "@/lib/axios";
import type {
  AdminStatsResponse,
  LeaderStatsResponse,
  InternStatsResponse,
} from "@/types/stats";

export const statsService = {
  getAdminStats: async (): Promise<AdminStatsResponse> => {
    const response = await api.get<AdminStatsResponse>("/stats");
    return response.data;
  },

  getLeaderStats: async (): Promise<LeaderStatsResponse> => {
    const response = await api.get<LeaderStatsResponse>("/stats/my");
    return response.data;
  },

  getInternStats: async (): Promise<InternStatsResponse> => {
    const response = await api.get<InternStatsResponse>("/stats/me");
    return response.data;
  },
};
