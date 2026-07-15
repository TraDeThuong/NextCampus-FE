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
    avatarUrl: string | null;
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

// GET /auth/me
export interface MeUser {
    id: string;
    email: string;
    fullName: string;
    role: "ADMIN" | "LEADER" | "INTERN" | string;
    isActive: boolean;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface MeSuccessResponse {
    success: boolean;
    data: MeUser;
}

// POST /auth/refresh
export interface RefreshPayload {
    refreshToken: string;
}

export interface RefreshSuccessResponse {
    success: boolean;
    data: AuthTokens;
}

// POST /auth/logout
export interface LogoutPayload {
    refreshToken: string;
}

// POST /auth/forgot-password
export interface ForgotPasswordPayload {
    email: string;
}

// POST /auth/reset-password
export interface ResetPasswordPayload {
    token: string;
    password: string;
}

// Generic success message response
export interface MessageSuccessResponse {
    success: boolean;
    message: string;
}

// PUT /auth/me
export interface UpdateProfilePayload {
    fullName: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}