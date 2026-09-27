import { formatInTimeZone } from "date-fns-tz";
import { CLINIC_TZ } from "@/lib/day";
import RoleSwitcher from "./RoleSwitcher";
import MobileNav from "./MobileNav";

export default function TopBar({
  role,
  clinicPhone,
  clinicName,
  logoInitials,
}: {
  role: string;
  clinicPhone: string;
  clinicName: string;
  logoInitials: string;
}) {
  const today = formatInTimeZone(new Date(), CLINIC_TZ, "EEEE, d MMMM yyyy");
  return (
    <header className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav role={role} clinicName={clinicName} logoInitials={logoInitials} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">{today}</p>
          {clinicPhone && <p className="truncate text-xs text-slate-400">{clinicPhone}</p>}
        </div>
      </div>
      <RoleSwitcher role={role} />
    </header>
  );
}
