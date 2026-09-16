import api from "@/lib/axios";
import type {
  SystemSettingsResponse,
  SystemSetting,
} from "@/types/system-setting";

export const systemSettingService = {
  // Lấy toàn bộ cấu hình hệ thống: GET /system-settings
  getSettings: async (): Promise<SystemSettingsResponse> => {
    const response = await api.get<SystemSettingsResponse>("/system-settings");
    return response.data;
  },

  // Cập nhật 1 tham số cấu hình: PUT /system-settings/:key
  updateSetting: async (
    key: string,
    value: string
  ): Promise<{ success: boolean; data: SystemSetting }> => {
    const response = await api.put<{ success: boolean; data: SystemSetting }>(
      `/system-settings/${key}`,
      { value }
    );
    return response.data;
  },

  // Cập nhật hàng loạt tham số (Batch): POST /system-settings/batch
  batchUpdateSettings: async (
    settings: Record<string, string>
  ): Promise<{ success: boolean; data: SystemSetting[] }> => {
    const response = await api.post<{ success: boolean; data: SystemSetting[] }>(
      "/system-settings/batch",
      { settings }
    );
    return response.data;
  },
};
