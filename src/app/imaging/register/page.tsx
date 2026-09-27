import { prisma } from "@/lib/db";
import PrintButton from "@/components/PrintButton";
import { BackLink } from "@/components/ui";
import { fmtDate, ageGender } from "@/lib/format";

export const dynamic = "force-dynamic";

function sideLabel(side?: string | null) {
  if (!side || side === "NA") return "";
  return side === "LEFT" ? "L" : side === "RIGHT" ? "R" : side;
}

// F-12 — printable AERB / radiation exposure register (statutory X-ray log).
export default async function AerbRegisterPage() {
  const [clinic, studies] = await Promise.all([
    prisma.clinic.findFirst(),
    prisma.imagingStudy.findMany({
      include: { patient: true, operator: true, order: { include: { orderedBy: true } } },
      orderBy: { studyDate: "desc" },
    }),
  ]);

  const renewal = clinic?.aerbRenewal ? new Date(clinic.aerbRenewal) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <BackLink href="/imaging">← Back to imaging</BackLink>
        <PrintButton label="Print register" />
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
              <p className="text-xs text-slate-500">{clinic?.address}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="text-sm font-semibold text-slate-800">Diagnostic X-ray Register</p>
            <p>AERB / radiation exposure log</p>
            <p>Generated {fmtDate(new Date())}</p>
          </div>
        </div>

        {/* AERB licence block */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-sm md:grid-cols-4">
          <p><span className="text-slate-400">AERB licence:</span> <span className="font-medium">{clinic?.aerbLicenceNo || "—"}</span></p>
          <p><span className="text-slate-400">RSO:</span> {clinic?.aerbRso || "—"}</p>
          <p><span className="text-slate-400">Renewal due:</span> {renewal ? fmtDate(renewal) : "—"}</p>
          <p><span className="text-slate-400">Total studies:</span> {studies.length}</p>
        </div>

        {/* Register table */}
        <table className="mt-5 w-full text-xs">
          <thead>
            <tr className="border-b border-slate-300 text-left uppercase text-slate-400">
              <th className="py-2 pr-2">Date</th>
              <th className="py-2 pr-2">Patient</th>
              <th className="py-2 pr-2">Age/Sex</th>
              <th className="py-2 pr-2">Study</th>
              <th className="py-2 pr-2">Machine</th>
              <th className="py-2 pr-2 text-right">kVp</th>
              <th className="py-2 pr-2 text-right">mAs</th>
              <th className="py-2 pr-2">Operator</th>
              <th className="py-2 pr-2">Referred by</th>
            </tr>
          </thead>
          <tbody>
            {studies.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 align-top">
                <td className="py-1.5 pr-2 whitespace-nowrap">{fmtDate(s.studyDate)}</td>
                <td className="py-1.5 pr-2">{s.patient.name}</td>
                <td className="py-1.5 pr-2 whitespace-nowrap">{ageGender(s.patient.age, s.patient.gender)}</td>
                <td className="py-1.5 pr-2">
                  {s.bodyPart}
                  {sideLabel(s.side) ? ` (${sideLabel(s.side)})` : ""}
                  {s.view ? ` · ${s.view}` : ""}
                </td>
                <td className="py-1.5 pr-2">{s.machineModel || "—"}</td>
                <td className="py-1.5 pr-2 text-right">{s.kvp ?? "—"}</td>
                <td className="py-1.5 pr-2 text-right">{s.mas ?? "—"}</td>
                <td className="py-1.5 pr-2">{s.operator?.name || "—"}</td>
                <td className="py-1.5 pr-2">{s.order?.orderedBy?.name || "—"}</td>
              </tr>
            ))}
            {studies.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-400">No studies recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="mt-6 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
          Radiation exposure register maintained per AERB (Atomic Energy Regulatory Board) requirements. Computer-generated
          from {clinic?.name} imaging records.
        </p>
      </div>
    </div>
  );
}
