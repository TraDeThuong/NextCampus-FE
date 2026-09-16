import api from "@/lib/axios";
import type {
  AdminStatsResponse,
  LeaderStatsResponse,
  InternStatsResponse,
} from "@/types/stats";

export const statsService = {
  // Thống kê toàn hệ thống cho Admin: GET /stats/admin
  getAdminStats: async (): Promise<AdminStatsResponse> => {
    const response = await api.get<AdminStatsResponse>("/stats/admin");
    return response.data;
  },

  // Thống kê team cho Leader: GET /stats/leader
  getLeaderStats: async (): Promise<LeaderStatsResponse> => {
    const response = await api.get<LeaderStatsResponse>("/stats/leader");
    return response.data;
  },

  // Thống kê cá nhân cho Thực tập sinh (hoặc xem chi tiết theo internId): GET /stats/intern
  getInternStats: async (internId?: string): Promise<InternStatsResponse> => {
    const response = await api.get<InternStatsResponse>("/stats/intern", {
      params: internId ? { internId } : undefined,
    });
    return response.data;
  },
};
