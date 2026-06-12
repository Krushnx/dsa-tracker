import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/problems", "/progress", "/goals", "/profile", "/onboarding"];

// Routes that authenticated users should not see
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export default auth((req: NextRequest & { auth: { user?: { id?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user?.id;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/signup
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Run on all routes except static assets and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
