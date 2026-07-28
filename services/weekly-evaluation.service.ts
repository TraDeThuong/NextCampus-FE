import api from "@/lib/axios";
import type {
  WeeklyEvaluationListResponse,
  WeeklyEvaluationQueryParams,
} from "@/types/weekly-evaluation";

export const weeklyEvaluationService = {
  getEvaluations: async (
    params?: WeeklyEvaluationQueryParams,
  ): Promise<WeeklyEvaluationListResponse> => {
    const response = await api.get<WeeklyEvaluationListResponse>(
      "/weekly-evaluations",
      { params },
    );
    return response.data;
  },
};
