import api from "@/lib/axios";
import type {
    InternSuccessResponse,
    InternListResponse,
    InternQueryParams,
    CreateInternPayload,
    UpdateInternPayload,
    UpdateMeInternPayload,
} from "@/types/intern";
import type { MessageSuccessResponse } from "@/types/auth";

export const internService = {
    // ─── Self-service (INTERN) ──────────────────────────────────────

    getMyIntern: async (): Promise<InternSuccessResponse> => {
        const response = await api.get<InternSuccessResponse>("/interns/me");
        return response.data;
    },

    updateMyIntern: async (
        payload: UpdateMeInternPayload,
    ): Promise<InternSuccessResponse> => {
        const response = await api.put<InternSuccessResponse>(
            "/interns/me",
            payload,
        );
        return response.data;
    },

    // ─── Admin / Leader ─────────────────────────────────────────────

        // GET /interns/me
    getInterns: async (
        params?: InternQueryParams,
    ): Promise<InternListResponse> => {
        const response = await api.get<InternListResponse>("/interns", {
            params,
        });
        return response.data;
    },
        //GET /interns/:id
    getIntern: async (id: string): Promise<InternSuccessResponse> => {
        const response = await api.get<InternSuccessResponse>(
            `/interns/${id}`,
        );
        return response.data;
    },
        //POST /interns
    createIntern: async (
        payload: CreateInternPayload,
    ): Promise<InternSuccessResponse> => {
        const response = await api.post<InternSuccessResponse>(
            "/interns",
            payload,
        );
        return response.data;
    },
        //PUT /interns/:id
    updateIntern: async (
        id: string,
        payload: UpdateInternPayload,
    ): Promise<InternSuccessResponse> => {
        const response = await api.put<InternSuccessResponse>(
            `/interns/${id}`,
            payload,
        );
        return response.data;
    },
        //DELETE /interns/:id
    deleteIntern: async (id: string): Promise<MessageSuccessResponse> => {
        const response = await api.delete<MessageSuccessResponse>(
            `/interns/${id}`,
        );
        return response.data;
    },
};
