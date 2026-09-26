import { toZonedTime, fromZonedTime } from "date-fns-tz";

// The clinic operates on India time. India has no DST, so this is stable.
// "Today" is computed in this zone regardless of the server's timezone
// (Vercel runs in UTC), so the queue / day-end / reports match the clinic's day.
export const CLINIC_TZ = "Asia/Kolkata";

export function todayRange() {
  const zoned = toZonedTime(new Date(), CLINIC_TZ);
  const startWall = new Date(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), 0, 0, 0, 0);
  const endWall = new Date(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), 23, 59, 59, 999);
  return { start: fromZonedTime(startWall, CLINIC_TZ), end: fromZonedTime(endWall, CLINIC_TZ) };
}
