import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./token";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // Required for the HTTP-only refreshToken cookie to be sent on cross-origin requests.
    withCredentials: true,
    timeout: 30000,
});

// Request interceptor — attach in-memory access token
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Shared refresh promise to handle concurrent requests without double calls
let refreshPromise: Promise<string> | null = null;

export async function executeTokenRefresh(): Promise<string> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            // POST /auth/refresh — no body; refreshToken cookie sent automatically
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            );
            const { accessToken } = response.data.data;
            setAccessToken(accessToken);
            return accessToken;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// Response interceptor — silent token refresh on 401
// The refreshToken is sent automatically via the HTTP-only cookie (withCredentials: true).
// No token is ever read from or written to localStorage.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/login") &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/forgot-password") &&
            !originalRequest.url?.includes("/auth/reset-password")
        ) {
            originalRequest._retry = true;

            try {
                const accessToken = await executeTokenRefresh();
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                clearAccessToken();
                if (typeof window !== "undefined") {
                    const pathname = window.location.pathname;
                    const isPublicRoute =
                        pathname === "/login" ||
                        pathname === "/forgot-password" ||
                        pathname === "/reset-password" ||
                        pathname.startsWith("/onboarding");

                    if (!isPublicRoute) {
                        window.location.href = "/login";
                    }
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
            const errorCode = error.response?.data?.code;
            if (
                (errorCode === "USER_INACTIVE" || 
                error.response?.data?.message?.toLowerCase().includes("inactive")) &&
                !originalRequest.url?.includes("/auth/login")
            ) {
                clearAccessToken();
                if (typeof window !== "undefined") {
                    window.location.href = "/login?reason=inactive";
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
