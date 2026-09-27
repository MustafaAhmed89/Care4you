import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// F-23 — real authentication. Email + password verified against the Staff table;
// identity/role travel in a JWT session cookie (no DB session table needed).
//
// NOTE: this module pulls in bcrypt + Prisma (Node runtime only). Do NOT import it
// from middleware (edge) — middleware does a lightweight session-cookie presence
// check instead, and real role enforcement runs server-side (see src/lib/session.ts).
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const email = String(creds?.email || "").trim().toLowerCase();
        const password = String(creds?.password || "");
        if (!email || !password) return null;

        // findFirst (not findUnique): the DB-level UNIQUE(email) index is deferred
        // (see schema note) — seed emails are distinct, so this is unambiguous.
        const staff = await prisma.staff.findFirst({ where: { email } });
        if (!staff || !staff.active || !staff.passwordHash) return null;

        const ok = await bcrypt.compare(password, staff.passwordHash);
        if (!ok) return null;

        // best-effort last-login stamp; never block sign-in on it
        try {
          await prisma.staff.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });
        } catch {
          /* ignore */
        }

        return { id: staff.id, name: staff.name, email: staff.email, role: staff.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).staffId = (user as any).id;
        (token as any).role = (user as any).role;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).staffId = (token as any).staffId;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
});
