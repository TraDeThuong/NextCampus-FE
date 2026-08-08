import api from "@/lib/axios";
import type { SystemSettingsResponse } from "@/types/system-setting";

export const systemSettingService = {
  getSettings: async (): Promise<SystemSettingsResponse> => {
    const response = await api.get<SystemSettingsResponse>("/settings");
    return response.data;
  },
};
