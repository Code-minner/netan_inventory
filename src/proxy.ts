import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/reset-password",
  "/verify-email",
  "/set-password",
  "/success",
  "/client-form",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname.startsWith("/api/auth/login")) return true;
  if (pathname.startsWith("/api/auth/register")) return true;
  if (pathname.startsWith("/api/auth/setup")) return true;
  if (pathname.startsWith("/api/auth/forgot")) return true;
  if (pathname.startsWith("/api/auth/reset")) return true;
  if (pathname.startsWith("/api/forms/")) return true;
  return PUBLIC_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const hasSession =
    Boolean(request.cookies.get("netan_access_token")?.value) ||
    Boolean(request.cookies.get("netan_refresh_token")?.value);

  if (!isPublicPath(pathname) && !hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (
    hasSession &&
    (pathname === "/login" || pathname === "/register") &&
    !request.nextUrl.searchParams.get("token")
  ) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
