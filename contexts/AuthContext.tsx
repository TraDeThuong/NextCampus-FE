"use client";

import { createContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import { getAccessToken } from "@/lib/token";
import { authService } from "@/services/auth.service";
import { setTokens, clearTokens } from "@/lib/token";
import type { LoginUser, AuthTokens } from "@/types/auth";

interface AuthState {
    user: LoginUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Actions that update the authentication state.
type AuthAction =
    | { type: "SET_USER"; user: LoginUser }
    | { type: "LOGIN"; tokens: AuthTokens; user: LoginUser; remember: boolean }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; isLoading: boolean }
    | { type: "UPDATE_USER"; user: Partial<LoginUser> };

interface AuthContextValue {
    state: AuthState;
    login: (tokens: AuthTokens, user: LoginUser, remember: boolean) => void;
    logout: () => Promise<void>;
    updateUser: (user: Partial<LoginUser>) => void;
}

// Handles all authentication state updates.
function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "SET_USER":
            return { ...state, user: action.user, isAuthenticated: true, isLoading: false };

        // Save tokens and update authentication state after login.
        case "LOGIN":
            setTokens(action.tokens.accessToken, action.tokens.refreshToken, action.remember);
            return { user: action.user, isAuthenticated: true, isLoading: false };

        // Clear tokens and reset authentication state.
        case "LOGOUT":
            clearTokens();
            return { user: null, isAuthenticated: false, isLoading: false };

        case "UPDATE_USER":
            return { ...state, user: state.user ? { ...state.user, ...action.user } : null };

        // Update loading status.
        case "SET_LOADING":
            return { ...state, isLoading: action.isLoading };

        default:
            return state;
    }
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // Wait until the authentication check is complete.
};

// Authentication context shared across the application.
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // On mount: check for an existing access token and restore the user session.
    useEffect(() => {
        const token = getAccessToken();
        if (!token) {
            dispatch({ type: "SET_LOADING", isLoading: false });
            return;
        }

        authService
            .me()
            .then((res) => {
                const { id, email, fullName, role, avatarUrl } = res.data;
                dispatch({ type: "SET_USER", user: { id, email, fullName, role, avatarUrl } });
            })
            .catch(() => {
                clearTokens();
                dispatch({ type: "LOGOUT" });
            });
    }, []);

    // Store tokens and update the authentication state after a successful login.
    const login = useCallback((tokens: AuthTokens, user: LoginUser, remember: boolean) => {
        dispatch({ type: "LOGIN", tokens, user, remember });
    }, []);

    // Notify the server, then clear the local authentication state.
    const logout = useCallback(async () => {
        try {
            const { getRefreshToken } = await import("@/lib/token");
            const refreshToken = getRefreshToken();

            if (refreshToken) {
                await authService.logout({ refreshToken });
            }
        } finally {
            dispatch({ type: "LOGOUT" });
        } dispatch({ type: "LOGOUT" });
    }, []);

    const updateUser = useCallback((user: Partial<LoginUser>) => {
        dispatch({ type: "UPDATE_USER", user });
    }, []);

    return (
        <AuthContext.Provider value={{ state, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}