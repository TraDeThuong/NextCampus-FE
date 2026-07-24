import { NextResponse, type NextRequest } from "next/server";

interface JwtPayload {
    id?: string;
    email?: string;
    role?: string;
    exp?: number;
}

/**
 * Fast, lightweight Base64 URL decoder for JWT payloads in Next.js Edge Server.
 */
function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const base64Url = parts[1];
        let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
            base64 += "=";
        }
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for Next.js internal data/routing requests to prevent race conditions
    // where the cookie is not yet fully written during client-side SPA navigation.
    if (pathname.startsWith("/_next") || request.headers.has("x-nextjs-data")) {
        return NextResponse.next();
    }

    const refreshToken = request.cookies.get("refreshToken")?.value;

    let payload: JwtPayload | null = null;
    if (refreshToken) {
        payload = decodeJwtPayload(refreshToken);
        // Invalidate payload if token has expired
        if (payload?.exp && payload.exp * 1000 < Date.now()) {
            payload = null;
        }
    }

    const isAuthenticated = !!payload && !!payload.role;
    const userRole = payload?.role?.toLowerCase();

    const isAuthRoute =
        pathname.startsWith("/login") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");

    const isDashboardRoute =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/leader") ||
        pathname.startsWith("/intern");

    // 1. Authenticated user accessing auth routes (/login, /forgot-password) -> Redirect to their role dashboard
    if (isAuthenticated && isAuthRoute) {
        const targetDashboard = `/${userRole}/dashboard`;
        return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // 2. Authenticated user accessing root "/" -> Redirect to their role dashboard
    if (isAuthenticated && pathname === "/") {
        const targetDashboard = `/${userRole}/dashboard`;
        return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // 3. Unauthenticated user accessing protected dashboard routes -> Redirect immediately to /login (HTTP 307)
    if (!isAuthenticated && isDashboardRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 4. Authenticated user accessing wrong role area -> Redirect to own dashboard
    if (isAuthenticated && isDashboardRoute) {
        if (pathname.startsWith("/admin") && userRole !== "admin") {
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
        }
        if (pathname.startsWith("/leader") && userRole !== "leader") {
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
        }
        if (pathname.startsWith("/intern") && userRole !== "intern") {
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
        }
    }

    // Allow all other routes (e.g., /onboarding, static pages, etc.) to proceed normally
    return NextResponse.next();
}

/**
 * Standard Next.js Matcher Pattern:
 * Runs proxy.ts on all pages EXCEPT static files, image optimizations, and public assets (.png, .svg, etc.).
 * Fully covers all current and future routes automatically.
 */
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
