export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginUser {
    id: string;
    email: string;
    fullName: string;
    role: "ADMIN" | "LEADER" | "INTERN" | string; // Hỗ trợ cả chữ hoa/thường tùy API
}

// Update LoginSuccessResponse.data to include user
export interface LoginSuccessResponse {
    success: boolean;
    data: AuthTokens & {
        user: LoginUser;
    };
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
    code: string;
}