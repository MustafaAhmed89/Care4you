import { notFound } from "next/navigation";
import { CalendarClock, Check, RotateCcw, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import AppointmentActions from "@/components/AppointmentActions";
import { fmtDateTime } from "@/lib/format";
import { SERVICE_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const BANNER: Record<string, { cls: string; icon: JSX.Element; text: string }> = {
  CONFIRMED: {
    cls: "bg-green-50 text-green-800 border-green-200",
    icon: <Check size={16} className="mt-0.5 shrink-0" />,
    text: "You're confirmed — thank you! We look forward to seeing you.",
  },
  RESCHEDULE: {
    cls: "bg-amber-50 text-amber-800 border-amber-200",
    icon: <RotateCcw size={16} className="mt-0.5 shrink-0" />,
    text: "Reschedule requested. The clinic will call you to arrange a new time.",
  },
  CANCELLED: {
    cls: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle size={16} className="mt-0.5 shrink-0" />,
    text: "This appointment has been cancelled. Contact the clinic if this was a mistake.",
  },
};

export default async function AppointmentManagePage({ params }: { params: { id: string } }) {
  const [appt, clinic] = await Promise.all([
    prisma.appointment.findUnique({ where: { id: params.id }, include: { patient: true, provider: true } }),
    prisma.clinic.findFirst(),
  ]);
  if (!appt) notFound();

  const readOnly = ["CHECKED_IN", "IN_PROGRESS", "COMPLETED"].includes(appt.status);
  const banner = appt.patientResponse ? BANNER[appt.patientResponse] : null;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {/* Clinic header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">
          {clinic?.logoInitials}
        </span>
        <div>
          <p className="text-base font-bold text-slate-900">{clinic?.name}</p>
          <p className="text-xs text-slate-500">{clinic?.tagline}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-lg font-semibold text-slate-900">Hi {appt.patient.name.split(" ")[0]},</h1>
        <p className="mt-1 text-sm text-slate-600">Here are your appointment details at {clinic?.name}.</p>

        <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <CalendarClock size={16} className="shrink-0 text-brand-600" />
            {fmtDateTime(appt.scheduledStart)}
          </div>
          <p className="text-slate-600">
            {SERVICE_LABELS[appt.serviceType] || appt.serviceType} with {appt.provider.name}
          </p>
          {appt.tokenNo ? <p className="text-slate-500">Token no. {appt.tokenNo}</p> : null}
        </div>

        {banner && (
          <div className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${banner.cls}`}>
            {banner.icon}
            <span>{banner.text}</span>
          </div>
        )}

        <div className="mt-5">
          {readOnly ? (
            <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-sm text-slate-500">
              This appointment is already in progress or complete. Please call the clinic
              {clinic?.phone ? ` at ${clinic.phone}` : ""} for any changes.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm font-medium text-slate-700">
                {appt.patientResponse ? "Need to change your response?" : "Can you make it?"}
              </p>
              {/* Remount when a response is recorded so the client form resets to its buttons. */}
              <AppointmentActions key={appt.respondedAt?.toISOString() ?? "new"} id={appt.id} />
            </>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        {clinic?.name}
        {clinic?.phone ? ` · ${clinic.phone}` : ""}
      </p>
    </div>
  );
}
