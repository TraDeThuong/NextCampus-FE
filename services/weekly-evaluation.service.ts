import api from "@/lib/axios";
import type {
  WeeklyEvaluation,
  WeeklyEvaluationQueryParams,
  CreateWeeklyEvaluationPayload,
  UpdateWeeklyEvaluationPayload,
  AiSuggestionPayload,
  AiSuggestionData,
} from "@/types/weekly-evaluation";

export const weeklyEvaluationService = {
  getWeeklyEvaluations: async (
    params?: WeeklyEvaluationQueryParams
  ): Promise<{ success: boolean; data: WeeklyEvaluation[]; meta?: any }> => {
    const response = await api.get("/weekly-evaluations", { params });
    return response.data;
  },

  getWeeklyEvaluation: async (id: string): Promise<{ success: boolean; data: WeeklyEvaluation }> => {
    const response = await api.get(`/weekly-evaluations/${id}`);
    return response.data;
  },

  createWeeklyEvaluation: async (
    payload: CreateWeeklyEvaluationPayload
  ): Promise<{ success: boolean; data: WeeklyEvaluation }> => {
    const response = await api.post("/weekly-evaluations", payload);
    return response.data;
  },

  updateWeeklyEvaluation: async (
    id: string,
    payload: UpdateWeeklyEvaluationPayload
  ): Promise<{ success: boolean; data: WeeklyEvaluation }> => {
    const response = await api.put(`/weekly-evaluations/${id}`, payload);
    return response.data;
  },

  deleteWeeklyEvaluation: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/weekly-evaluations/${id}`);
    return response.data;
  },

  getAiSuggestion: async (
    payload: AiSuggestionPayload
  ): Promise<{ success: boolean; data: AiSuggestionData }> => {
    const response = await api.post("/weekly-evaluations/ai-suggestion", payload);
    return response.data;
  },
};
