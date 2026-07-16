import api from "@/lib/axios";
import type { DepartmentListResponse, PositionListResponse } from "@/types/department";

export const departmentService = {
    getDepartments: async (): Promise<DepartmentListResponse> => {
        const response = await api.get<DepartmentListResponse>("/departments");
        return response.data;
    },

    getPositions: async (departmentId: string): Promise<PositionListResponse> => {
        const response = await api.get<PositionListResponse>(
            `/departments/${departmentId}/positions`,
        );
        return response.data;
    },
};
