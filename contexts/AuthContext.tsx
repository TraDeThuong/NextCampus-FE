"use client";

import axios from "axios";
import { createContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import { setAccessToken, clearAccessToken } from "@/lib/token";
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

    useEffect(() => {
        axios
            .post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            )
            .then((res) => {
                const data = res.data?.data;
                if (data?.accessToken && data?.user) {
                    setAccessToken(data.accessToken);
                    dispatch({ type: "SET_USER", user: data.user });
                } else {
                    clearAccessToken();
                    dispatch({ type: "SET_LOADING", isLoading: false });
                }
            })
            .catch(() => {
                // No valid cookie → not authenticated
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