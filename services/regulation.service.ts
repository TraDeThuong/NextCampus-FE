import api from "@/lib/axios";
import type {
  RegulationSuccessResponse,
  RegulationListResponse,
  CreateRegulationPayload,
  UpdateRegulationPayload,
} from "@/types/regulation";
import type { MessageSuccessResponse } from "@/types/auth";

export const getActiveRegulationService = async (): Promise<RegulationSuccessResponse> => {
  const response = await api.get<RegulationSuccessResponse>("/regulations/active");
  return response.data;
};

export const regulationService = {
  getRegulations: async (): Promise<RegulationListResponse> => {
    const response = await api.get<RegulationListResponse>("/regulations");
    return response.data;
  },

  getRegulation: async (id: string): Promise<RegulationSuccessResponse> => {
    const response = await api.get<RegulationSuccessResponse>(`/regulations/${id}`);
    return response.data;
  },

  createRegulation: async (payload: CreateRegulationPayload): Promise<RegulationSuccessResponse> => {
    const response = await api.post<RegulationSuccessResponse>("/regulations", payload);
    return response.data;
  },

  updateRegulation: async (id: string, payload: UpdateRegulationPayload): Promise<RegulationSuccessResponse> => {
    const response = await api.put<RegulationSuccessResponse>(`/regulations/${id}`, payload);
    return response.data;
  },

  activateRegulation: async (id: string): Promise<RegulationSuccessResponse> => {
    const response = await api.patch<RegulationSuccessResponse>(`/regulations/${id}/activate`);
    return response.data;
  },

  deleteRegulation: async (id: string): Promise<MessageSuccessResponse> => {
    const response = await api.delete<MessageSuccessResponse>(`/regulations/${id}`);
    return response.data;
  },
};

