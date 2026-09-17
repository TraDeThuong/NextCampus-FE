import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { getAccessToken, setAccessToken, clearAccessToken } from "./token";

/**
 * Returns the localized pathname prefixed with current locale ('vi' or 'en')
 */
function getLocalePath(path: string): string {
    if (typeof window === "undefined") return path;
    const segments = window.location.pathname.split("/").filter(Boolean);
    const locale = segments[0];
    if (locale && ["vi", "en"].includes(locale)) {
        if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
            return path;
        }
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        return `/${locale}${normalizedPath}`;
    }
    return path;
}

/**
 * Checks whether the current path is a public authentication route
 */
function isPublicRoute(pathname: string): boolean {
    const segments = pathname.split("/").filter(Boolean);
    const localePrefix = segments[0];
    const cleanPath = localePrefix && ["vi", "en"].includes(localePrefix)
        ? "/" + segments.slice(1).join("/")
        : pathname;
    return (
        cleanPath === "/login" ||
        cleanPath === "/forgot-password" ||
        cleanPath === "/reset-password" ||
        cleanPath.startsWith("/onboarding")
    );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999/api/v2";

const api = axios.create({
    baseURL: API_BASE_URL,
    // Required for the HTTP-only refreshToken cookie to be sent on cross-origin requests.
    withCredentials: true,
    timeout: 30000,
});

// Request interceptor — attach in-memory access token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Shared refresh promise to handle concurrent requests without race conditions
let refreshPromise: Promise<string> | null = null;

export async function executeTokenRefresh(): Promise<string> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            // POST /auth/refresh — no body; refreshToken cookie sent automatically via withCredentials
            const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            );

            const accessToken: string | undefined =
                response.data?.data?.accessToken || response.data?.accessToken;

            if (!accessToken) {
                throw new Error("No access token returned from refresh endpoint");
            }

            setAccessToken(accessToken);
            return accessToken;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

interface ApiErrorResponse {
    success?: boolean;
    code?: string;
    errorCode?: string;
    message?: string;
    data?: unknown;
}

// Response interceptor:
// 1. Silent token refresh on 401 using in-memory lock
// 2. 403 Forbidden handling: USER_INACTIVE redirects to login, Cross-Resource shows polite toast without logout
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const status = error.response?.status;

        // -------------------------------------------------------------------------
        // 1. Handle 401 Unauthorized — Silent Token Refresh
        // -------------------------------------------------------------------------
        const isAuthBypassUrl =
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh") ||
            originalRequest.url?.includes("/auth/forgot-password") ||
            originalRequest.url?.includes("/auth/reset-password");

        if (status === 401 && !originalRequest._retry && !isAuthBypassUrl) {
            originalRequest._retry = true;

            try {
                const accessToken = await executeTokenRefresh();
                if (originalRequest.headers) {
                    if (typeof originalRequest.headers.set === "function") {
                        originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
                    } else {
                        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                    }
                }
                return api(originalRequest);
            } catch (refreshError) {
                clearAccessToken();
                if (typeof window !== "undefined") {
                    const pathname = window.location.pathname;
                    if (!isPublicRoute(pathname)) {
                        window.location.href = getLocalePath("/login");
                    }
                }
                return Promise.reject(refreshError);
            }
        }

        // -------------------------------------------------------------------------
        // 2. Handle 403 Forbidden — Account Inactive vs. Cross-Resource / Forbidden Action
        // -------------------------------------------------------------------------
        if (status === 403) {
            const errorData = error.response?.data;
            const errorCode = errorData?.code || errorData?.errorCode;
            const errorMessage = typeof errorData?.message === "string" ? errorData.message.toLowerCase() : "";

            const isUserInactive =
                errorCode === "USER_INACTIVE" ||
                errorMessage.includes("inactive") ||
                errorMessage.includes("vô hiệu hóa") ||
                errorMessage.includes("tài khoản của bạn đã bị vô hiệu hóa");

            if (isUserInactive && !originalRequest.url?.includes("/auth/login")) {
                // Case 2.1: Account is deactivated/inactive -> clear token and redirect to login
                clearAccessToken();
                if (typeof window !== "undefined") {
                    window.location.href = getLocalePath("/login?reason=inactive");
                }
            } else {
                // Case 2.2: Cross-resource violation / Forbidden action (e.g. cross-department stats, uninvited meeting, TASK_ALREADY_COMPLETED)
                // NEVER automatically logout (session and token are valid). Show polite error toast.
                if (typeof window !== "undefined") {
                    const customMessage =
                        typeof errorData?.message === "string" && errorData.message.trim().length > 0
                            ? errorData.message
                            : "Bạn không có quyền thực hiện thao tác hoặc truy cập tài nguyên này.";
                    toast.error(customMessage, {
                        id: "forbidden-access-error",
                    });
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
