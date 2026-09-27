import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Expose the current pathname to server layouts (the App Router doesn't provide it
// directly) so the root layout can render patient-facing pages (/appt/*) without the
// staff shell (sidebar / role switcher). See src/app/layout.tsx.
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Skip API routes and static assets; only page requests need the pathname header.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|samples).*)"],
};
