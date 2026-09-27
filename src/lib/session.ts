import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// F-23 — real session helpers (replaces the demo `oc_role` cookie / role-switcher).
export type SessionUser = { staffId: string; role: string; name: string; email: string | null };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  const u = session?.user as any;
  if (!u?.staffId) return null;
  return { staffId: u.staffId, role: u.role, name: u.name ?? "", email: u.email ?? null };
}

// Redirects to /login if not signed in.
export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}

// Role gate for pages/actions (used broadly in PR-B). Redirects to the dashboard if
// the signed-in user's role isn't in `roles` (empty roles = any signed-in user).
export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const u = await requireUser();
  if (roles.length && !roles.includes(u.role)) redirect("/");
  return u;
}
