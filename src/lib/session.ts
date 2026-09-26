import { cookies } from "next/headers";
import { ROLES } from "./constants";

const ROLE_COOKIE = "oc_role";

// Demo "auth": the current role is stored in a cookie and switchable from the
// top bar. Real deployments would replace this with proper authentication.
export function getCurrentRole(): string {
  const c = cookies().get(ROLE_COOKIE)?.value;
  if (c && c in ROLES) return c;
  return ROLES.OWNER_DOCTOR;
}

export const ROLE_COOKIE_NAME = ROLE_COOKIE;
