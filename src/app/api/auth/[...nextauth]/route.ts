import { handlers } from "@/lib/auth";

// F-23 — NextAuth route handlers (sign-in / sign-out / session / callback).
// Node runtime: the Credentials provider uses bcrypt + Prisma.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
