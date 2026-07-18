"use client";

import { createContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import { setAccessToken, clearAccessToken, clearRememberedEmail } from "@/lib/token";
import { authService } from "@/services/auth.service";
import type { LoginUser, AuthTokens } from "@/types/auth";

interface AuthState {
    user: LoginUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

type AuthAction =
    | { type: "SET_USER"; user: LoginUser }
    | { type: "LOGIN"; token: AuthTokens; user: LoginUser }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; isLoading: boolean }
    | { type: "UPDATE_USER"; user: Partial<LoginUser> };

interface AuthContextValue {
    state: AuthState;
    login: (token: AuthTokens, user: LoginUser) => void;
    logout: () => Promise<void>;
    updateUser: (user: Partial<LoginUser>) => void;
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "SET_USER":
            return { ...state, user: action.user, isAuthenticated: true, isLoading: false };

        case "LOGIN":
            // Store access token in memory — never in localStorage/sessionStorage
            setAccessToken(action.token.accessToken);
            return { user: action.user, isAuthenticated: true, isLoading: false };

        case "LOGOUT":
            clearAccessToken();
            return { user: null, isAuthenticated: false, isLoading: false };

        case "UPDATE_USER":
            return { ...state, user: state.user ? { ...state.user, ...action.user } : null };

        case "SET_LOADING":
            return { ...state, isLoading: action.isLoading };

        default:
            return state;
    }
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    /**
     * On mount: attempt a silent token refresh using the HTTP-only cookie.
     *
     * - If the cookie is present and valid → we get a new accessToken,
     *   store it in memory, and fetch the user profile.
     * - If the cookie is absent or expired → the user is not authenticated.
     *
     * This replaces the old pattern of reading a token from localStorage.
     */
    useEffect(() => {
        authService
            .refresh()
            .then((res) => {
                const { accessToken } = res.data;
                setAccessToken(accessToken);
                return authService.me();
            })
            .then((res) => {
                const { id, email, fullName, role, avatarUrl } = res.data;
                dispatch({ type: "SET_USER", user: { id, email, fullName, role, avatarUrl } });
            })
            .catch(() => {
                // No valid cookie → not authenticated, stay on login page
                clearAccessToken();
                dispatch({ type: "SET_LOADING", isLoading: false });
            });
    }, []);

    // Store accessToken in memory and update auth state after a successful login.
    const login = useCallback((token: AuthTokens, user: LoginUser) => {
        dispatch({ type: "LOGIN", token, user });
    }, []);

    // Notify the server (cookie is sent automatically), then clear local state.
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } finally {
            clearRememberedEmail();
            dispatch({ type: "LOGOUT" });
        }
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