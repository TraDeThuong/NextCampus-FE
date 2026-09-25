import api from "@/lib/axios";
import type {
  WeeklyEvaluation,
  WeeklyEvaluationListResponse,
  WeeklyEvaluationQueryParams,
  CreateWeeklyEvaluationPayload,
  UpdateWeeklyEvaluationPayload,
  AiSuggestRequestDto,
  AiSuggestionData,
  WeeklyEvaluationSummary,
} from "@/types/weekly-evaluation";

export const weeklyEvaluationService = {
  getWeeklyEvaluations: async (
    params?: WeeklyEvaluationQueryParams,
  ): Promise<WeeklyEvaluationListResponse> => {
    const response = await api.get<Record<string, unknown>>(
      "/weekly-evaluations",
      { params },
    );
    const resData = response.data || {};
    const rawItems = (
      Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.items)
          ? resData.items
          : []
    ) as WeeklyEvaluation[];

    const metaObj = (
      resData.meta && typeof resData.meta === "object" ? resData.meta : {}
    ) as Record<string, unknown>;

    const total = Number(resData.total ?? metaObj.total ?? rawItems.length);
    const page = Number(resData.page ?? metaObj.page ?? (params?.page || 1));
    const limit = Number(resData.limit ?? metaObj.limit ?? (params?.limit || 20));
    const totalPages = Number(
      resData.totalPages ??
        metaObj.totalPages ??
        Math.max(1, Math.ceil(total / Math.max(1, limit))),
    );

    return {
      success: resData.success !== false,
      data: rawItems,
      items: rawItems,
      total,
      page,
      limit,
      totalPages,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  getWeeklyEvaluation: async (id: string): Promise<{ success: boolean; data: WeeklyEvaluation }> => {
    const response = await api.get<{ success: boolean; data: WeeklyEvaluation }>(`/weekly-evaluations/${id}`);
    return response.data;
  },

  createWeeklyEvaluation: async (
    payload: CreateWeeklyEvaluationPayload
  ): Promise<{ success: boolean; data: WeeklyEvaluation }> => {
    const response = await api.post<{ success: boolean; data: WeeklyEvaluation }>("/weekly-evaluations", payload);
    return response.data;
  },

  updateWeeklyEvaluation: async (
    id: string,
    payload: UpdateWeeklyEvaluationPayload
  ): Promise<{ success: boolean; data: WeeklyEvaluation }> => {
    const response = await api.put<{ success: boolean; data: WeeklyEvaluation }>(`/weekly-evaluations/${id}`, payload);
    return response.data;
  },

  deleteWeeklyEvaluation: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/weekly-evaluations/${id}`);
    return response.data;
  },

  // Gợi ý đánh giá tuần từ AI: POST /weekly-evaluations/ai-suggest
  getAiSuggestion: async (
    payload: AiSuggestRequestDto
  ): Promise<{ success: boolean; data: AiSuggestionData }> => {
    const response = await api.post<{ success: boolean; data: AiSuggestionData }>(
      "/weekly-evaluations/ai-suggest",
      payload
    );
    return response.data;
  },

  // Thực tập sinh xác nhận xem đánh giá: POST /weekly-evaluations/:id/confirm-view
  confirmView: async (id: string): Promise<{ success: boolean; data: WeeklyEvaluation }> => {
    const response = await api.post<{ success: boolean; data: WeeklyEvaluation }>(
      `/weekly-evaluations/${id}/confirm-view`
    );
    return response.data;
  },

  // Alias tương thích ngược cho confirmView
  markReviewed: async (id: string): Promise<{ success: boolean; data: WeeklyEvaluation }> => {
    return weeklyEvaluationService.confirmView(id);
  },

  // Tổng hợp tiến độ 6 tuần thực tập: GET /weekly-evaluations/intern/:internId/summary
  getInternSummary: async (
    internId: string
  ): Promise<{ success: boolean; data: WeeklyEvaluationSummary }> => {
    const response = await api.get<{ success: boolean; data: WeeklyEvaluationSummary }>(
      `/weekly-evaluations/intern/${internId}/summary`
    );
    return response.data;
  },
};
