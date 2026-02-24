import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/", "/landing",
  "/auth/signin", "/auth/signup", "/auth/register-school",
  "/auth/oauth-complete", "/auth/forgot-password", "/auth/reset-password",
  "/api/auth/login", "/api/auth/oauth-token", "/api/auth/register-school",
  "/api/auth/forgot-password", "/api/auth/reset-password",
  "/api/public", "/api/test-db",
];

const nextAuthPaths = [
  "/api/auth/callback", "/api/auth/csrf", "/api/auth/session",
  "/api/auth/signin", "/api/auth/signout", "/api/auth/providers", "/api/auth/error",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow NextAuth internal paths
  if (nextAuthPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // If logged in and visiting auth pages, redirect to dashboard
  const token = request.cookies.get("auth-token")?.value;
  if (token && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow public paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith("/api/public"))) {
    return NextResponse.next();
  }

  // Check cookie presence only (JWT verification done in route handlers via Node.js runtime)
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
