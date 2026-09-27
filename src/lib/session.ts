import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { roleCan, type ResourceKey } from "@/lib/constants";

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

// Action gate (F-23 PR-B). Fail-closed: the signed-in user's role MUST be listed.
// Denied → redirect to /patients (a page every role can open, so never loops).
export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const u = await requireUser();
  if (!roles.includes(u.role)) redirect("/patients");
  return u;
}

// Page gate (F-23 PR-B): enforce a resource's roles from the single RESOURCE_ROLES map.
export async function requireResource(resource: ResourceKey): Promise<SessionUser> {
  const u = await requireUser();
  if (!roleCan(u.role, resource)) redirect("/patients");
  return u;
}
