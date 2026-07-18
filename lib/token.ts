// ---------------------------------------------------------------------------
// Access Token — in-memory only
// ---------------------------------------------------------------------------

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
    return _accessToken;
}

export function setAccessToken(token: string): void {
    _accessToken = token;
}

export function clearAccessToken(): void {
    _accessToken = null;
}

// ---------------------------------------------------------------------------
// Remembered Email — localStorage (UX only, not sensitive)
// Lets the login form pre-fill the email field on the next visit.
// ---------------------------------------------------------------------------

const REMEMBERED_EMAIL_KEY = "rememberedEmail";

export function saveRememberedEmail(email: string): void {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
}

export function getRememberedEmail(): string | null {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY);
}

export function clearRememberedEmail(): void {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
}