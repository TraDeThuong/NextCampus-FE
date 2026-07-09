import api from "@/lib/axios";
import { LoginPayload, LoginSuccessResponse } from "@/types/auth";

export const authService = {
    login: async (payload: LoginPayload): Promise<LoginSuccessResponse> => {

        const response = await api.post<LoginSuccessResponse>("/auth/login", payload, {
            headers: {
                "Accept": "application/json",
            }
        });
        return response.data;
    },
};