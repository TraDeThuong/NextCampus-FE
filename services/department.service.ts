import api from "@/lib/axios";
import type {
    DepartmentListResponse,
    PositionListResponse,
    CreateDepartmentPayload,
    UpdateDepartmentPayload,
    CreatePositionPayload,
    UpdatePositionPayload,
    DepartmentSuccessResponse,
    PositionSuccessResponse,
} from "@/types/department";

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

    createDepartment: async (
        payload: CreateDepartmentPayload,
    ): Promise<DepartmentSuccessResponse> => {
        const response = await api.post<DepartmentSuccessResponse>(
            "/departments",
            payload,
        );
        return response.data;
    },

    updateDepartment: async (
        id: string,
        payload: UpdateDepartmentPayload,
    ): Promise<DepartmentSuccessResponse> => {
        const response = await api.put<DepartmentSuccessResponse>(
            `/departments/${id}`,
            payload,
        );
        return response.data;
    },

    deleteDepartment: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete<{ success: boolean; message: string }>(
            `/departments/${id}`,
        );
        return response.data;
    },

    createPosition: async (
        payload: CreatePositionPayload,
    ): Promise<PositionSuccessResponse> => {
        const response = await api.post<PositionSuccessResponse>(
            "/departments/positions",
            payload,
        );
        return response.data;
    },

    updatePosition: async (
        id: string,
        payload: UpdatePositionPayload,
    ): Promise<PositionSuccessResponse> => {
        const response = await api.put<PositionSuccessResponse>(
            `/departments/positions/${id}`,
            payload,
        );
        return response.data;
    },

    deletePosition: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete<{ success: boolean; message: string }>(
            `/departments/positions/${id}`,
        );
        return response.data;
    },
};

