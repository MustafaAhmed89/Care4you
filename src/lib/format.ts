import { formatInTimeZone } from "date-fns-tz";
import { CLINIC_TZ } from "./day";

// Money is stored as whole rupees (Int).
export function inr(amount: number): string {
  return "₹" + (amount ?? 0).toLocaleString("en-IN");
}

// All dates are rendered in the clinic's timezone (India), independent of server TZ.
export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), CLINIC_TZ, "d MMM yyyy");
}

export function fmtTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), CLINIC_TZ, "h:mm a");
}

export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), CLINIC_TZ, "d MMM yyyy, h:mm a");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function ageGender(age?: number | null, gender?: string | null): string {
  const g = gender === "M" ? "M" : gender === "F" ? "F" : gender || "";
  if (age && g) return `${age}${g}`;
  if (age) return `${age}y`;
  return g || "—";
}
