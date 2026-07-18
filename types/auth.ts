export interface LoginPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}

// Only accessToken is returned in the response body.
// refreshToken lives exclusively in the HTTP-only cookie managed by the server.
export interface AuthTokens {
    accessToken: string;
}

export interface LoginUser {
    id: string;
    email: string;
    fullName: string;
    role: "ADMIN" | "LEADER" | "INTERN" | string;
    avatarUrl: string | null;
}

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
export interface MeIntern {
    id: string;
    phone: string;
    department: string;
    position: string;
    startDate: string;
    duration: number;
    discordUsername: string | null;
    discordRoleGranted: boolean;
    status: string;
}

export interface MeNotificationSetting {
    id: string;
    webEnabled: boolean;
    emailEnabled: boolean;
    discordEnabled: boolean;
}

export interface MeUser {
    id: string;
    email: string;
    fullName: string;
    role: "ADMIN" | "LEADER" | "INTERN" | string;
    isActive: boolean;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    intern: MeIntern | null;
    notificationSetting: MeNotificationSetting | null;
}

export interface MeSuccessResponse {
    success: boolean;
    data: MeUser;
}

// POST /auth/refresh — no body needed, refreshToken sent via cookie automatically
export interface RefreshSuccessResponse {
    success: boolean;
    data: AuthTokens & {
        user: LoginUser;
    };
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