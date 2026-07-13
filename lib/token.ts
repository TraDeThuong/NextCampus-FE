// Storage keys for authentication tokens.
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

// Get the access token from localStorage or sessionStorage.
export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY) || sessionStorage.getItem(ACCESS_KEY);
}

// Get the refresh token from localStorage or sessionStorage.
export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
}

// Save tokens based on the "Remember Me" option.
// - remember = true  -> localStorage (persists after browser restart)
// - remember = false -> sessionStorage (cleared when the browser/tab is closed)
export function setTokens(accessToken: string, refreshToken: string, remember: boolean): void {
    if (remember) {
        localStorage.setItem(ACCESS_KEY, accessToken);
        localStorage.setItem(REFRESH_KEY, refreshToken);
        sessionStorage.removeItem(ACCESS_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
    } else {
        sessionStorage.setItem(ACCESS_KEY, accessToken);
        sessionStorage.setItem(REFRESH_KEY, refreshToken);
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    }
}

// Remove all stored authentication tokens.
export function clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
}