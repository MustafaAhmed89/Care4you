import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Two jobs:
//  1. F-03 — expose the pathname to the root layout (bare patient/login pages vs staff shell).
//  2. F-23 — gate staff routes behind a session cookie. This is an EDGE-SAFE presence
//     check only (no bcrypt/Prisma here); real role enforcement runs server-side in
//     src/lib/session.ts. API routes are excluded by the matcher and self-gate
//     (NextAuth handler, cron Bearer secret, WhatsApp verify token).
const PUBLIC_PREFIXES = ["/login", "/appt"];

function hasSessionCookie(req: NextRequest): boolean {
  // NextAuth v5 cookie names: dev = "authjs.session-token", https = "__Secure-…".
  return req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isPublic && !hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Skip API routes and static assets; only page requests need the gate + pathname header.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|samples).*)"],
};
