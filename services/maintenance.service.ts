import api from "@/lib/axios";
import type {
  MaintenanceStatusResponse,
  EnableMaintenancePayload,
  UpdateMaintenancePayload,
  MaintenanceActionResponse,
} from "@/types/maintenance";

export const maintenanceService = {
  // Lấy trạng thái và cấu hình bảo trì hệ thống
  getStatus: async (): Promise<MaintenanceStatusResponse> => {
    const response = await api.get<MaintenanceStatusResponse>("/maintenance/status");
    return response.data;
  },

  // Bật chế độ bảo trì
  enable: async (
    payload: EnableMaintenancePayload
  ): Promise<MaintenanceActionResponse> => {
    const response = await api.post<MaintenanceActionResponse>(
      "/maintenance/enable",
      payload
    );
    return response.data;
  },

  // Tắt chế độ bảo trì
  disable: async (): Promise<MaintenanceActionResponse> => {
    const response = await api.post<MaintenanceActionResponse>(
      "/maintenance/disable"
    );
    return response.data;
  },

  // Cập nhật cấu hình bảo trì (khi đã bật hoặc chuẩn bị trước)
  updateConfig: async (
    payload: UpdateMaintenancePayload
  ): Promise<MaintenanceActionResponse> => {
    const response = await api.put<MaintenanceActionResponse>(
      "/maintenance/config",
      payload
    );
    return response.data;
  },
};
