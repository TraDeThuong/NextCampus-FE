import api from "@/lib/axios";
import {
    LoginPayload,
    LoginSuccessResponse,
    MeSuccessResponse,
    RefreshPayload,
    RefreshSuccessResponse,
    LogoutPayload,
    MessageSuccessResponse,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    UpdateProfilePayload
} from "@/types/auth";

// All auth endpoints return JSON. 
// Axios automatically parses the JSON response, so response.data contains the response object.


export const authService = {
    login: async (payload: LoginPayload): Promise<LoginSuccessResponse> => {
        const response = await api.post<LoginSuccessResponse>("/auth/login", payload, {
            headers: {
                "Accept": "application/json", // Accept: tells the server which response format the client expects (e.g., JSON).
            }
        });
        return response.data;
    },

    updateMe: async (payload: UpdateProfilePayload): Promise<MeSuccessResponse> => {
        const response = await api.put<MeSuccessResponse>(
            "/auth/me",
            payload
        );

        return response.data;
    },

    me: async (): Promise<MeSuccessResponse> => {
        const response = await api.get<MeSuccessResponse>("/auth/me");
        return response.data;
    },

    refresh: async (payload: RefreshPayload): Promise<RefreshSuccessResponse> => {
        const response = await api.post<RefreshSuccessResponse>("/auth/refresh", payload);
        return response.data;
    },

    logout: async (payload: LogoutPayload): Promise<MessageSuccessResponse> => {
        const response = await api.post<MessageSuccessResponse>("/auth/logout", payload);
        return response.data;
    },

    forgotPassword: async (payload: ForgotPasswordPayload): Promise<MessageSuccessResponse> => {
        const response = await api.post<MessageSuccessResponse>("/auth/forgot-password", payload);
        return response.data;
    },

    resetPassword: async (payload: ResetPasswordPayload): Promise<MessageSuccessResponse> => {
        const response = await api.post<MessageSuccessResponse>("/auth/reset-password", payload);
        return response.data;
    },
};