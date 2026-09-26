import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PrintButton from "@/components/PrintButton";
import { BackLink } from "@/components/ui";
import { fmtDate, ageGender } from "@/lib/format";
import { SCHEDULE_FLAG_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function RxPrintPage({ params }: { params: { id: string } }) {
  const [rx, clinic] = await Promise.all([
    prisma.prescription.findUnique({
      where: { id: params.id },
      include: { lines: true, visit: { include: { patient: true, provider: true } } },
    }),
    prisma.clinic.findFirst(),
  ]);
  if (!rx || !rx.visit) notFound();
  const { patient, provider } = rx.visit;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <BackLink href={`/patients/${patient.id}`}>← Back to patient</BackLink>
        <PrintButton label="Print prescription" />
      </div>

      <div className="print-area rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-brand-600 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
              {clinic?.logoInitials}
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{clinic?.name}</h1>
              <p className="text-xs text-slate-500">{clinic?.tagline}</p>
              <p className="text-xs text-slate-500">{clinic?.address}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="text-sm font-semibold text-slate-800">{provider.name}</p>
            <p>Orthopaedic Surgeon</p>
            {clinic?.nmcRegNo && <p>NMC Reg. No: {clinic.nmcRegNo}</p>}
            <p>{clinic?.phone}</p>
          </div>
        </div>

        {/* Patient */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-sm">
          <p><span className="text-slate-400">Patient:</span> <span className="font-medium">{patient.name}</span></p>
          <p><span className="text-slate-400">Age/Sex:</span> {ageGender(patient.age, patient.gender)}</p>
          <p><span className="text-slate-400">Date:</span> {fmtDate(rx.visit.date)}</p>
          <p className="col-span-2"><span className="text-slate-400">Phone:</span> {patient.phone}</p>
          {rx.visit.diagnosis && <p className="col-span-3"><span className="text-slate-400">Diagnosis:</span> {rx.visit.diagnosis}</p>}
        </div>

        {/* Rx */}
        <div className="mt-6">
          <p className="mb-2 text-2xl font-serif text-brand-700">℞</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                <th className="py-2">Medicine (generic)</th>
                <th className="py-2">Dose</th>
                <th className="py-2">Frequency</th>
                <th className="py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {rx.lines.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-2.5">
                    <span className="font-medium text-slate-800">{l.genericName}</span>
                    {l.brandName ? <span className="text-slate-400"> ({l.brandName})</span> : null}
                    {l.scheduleFlag !== "NONE" && (
                      <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        {SCHEDULE_FLAG_LABELS[l.scheduleFlag]}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-slate-600">{l.dose || "—"}</td>
                  <td className="py-2.5 text-slate-600">{l.frequency || "—"}</td>
                  <td className="py-2.5 text-slate-600">{l.duration || "—"}</td>
                </tr>
              ))}
              {rx.lines.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-slate-400">No medicines prescribed.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {rx.advice && (
          <div className="mt-5 text-sm">
            <p className="font-medium text-slate-700">Advice</p>
            <p className="text-slate-600">{rx.advice}</p>
          </div>
        )}
        {rx.visit.followUpWeeks ? (
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-medium">Follow-up:</span> after {rx.visit.followUpWeeks} weeks.
          </p>
        ) : null}

        {/* Signature */}
        <div className="mt-12 flex items-end justify-between">
          <p className="text-[10px] text-slate-400">
            Generic names per NMC 2023 norms. This is a computer-generated prescription.
          </p>
          <div className="text-center">
            <div className="h-10 w-48 border-b border-slate-300"></div>
            <p className="mt-1 text-xs text-slate-500">{provider.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
