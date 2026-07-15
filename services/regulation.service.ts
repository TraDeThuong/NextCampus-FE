import api from "@/lib/axios";
import type { RegulationSuccessResponse } from "@/types/regulation";

export const getActiveRegulationService = async (): Promise<RegulationSuccessResponse> => {
  const response = await api.get<RegulationSuccessResponse>("/regulations/active");
  return response.data;
};
