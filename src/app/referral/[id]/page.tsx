import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireResource } from "@/lib/session";
import PrintButton from "@/components/PrintButton";
import { BackLink } from "@/components/ui";
import { fmtDate, ageGender } from "@/lib/format";

export const dynamic = "force-dynamic";

const PROVIDER_TITLE: Record<string, string> = {
  OWNER_DOCTOR: "Orthopaedic Surgeon",
  PHYSIO: "Physiotherapist",
};

export default async function ReferralPrintPage({ params }: { params: { id: string } }) {
  await requireResource("referral");
  const [ref, clinic] = await Promise.all([
    prisma.referral.findUnique({
      where: { id: params.id },
      include: { patient: true, provider: true },
    }),
    prisma.clinic.findFirst(),
  ]);
  if (!ref) notFound();
  const { patient, provider } = ref;

  const providerTitle = PROVIDER_TITLE[provider.role] || "Consultant";
  const regNo = provider.nmcRegNo || clinic?.nmcRegNo;
  const salutation = /^dr\.?\b/i.test(ref.referToName.trim()) ? `Dear ${ref.referToName},` : "Dear Colleague,";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <BackLink href={`/patients/${patient.id}`}>← Back to patient</BackLink>
        <PrintButton label="Print referral letter" />
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
            <p>{providerTitle}</p>
            {regNo && <p>NMC Reg. No: {regNo}</p>}
            <p>{clinic?.phone}</p>
          </div>
        </div>

        {/* Title */}
        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-wide text-slate-800">Referral Letter</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {ref.urgency === "URGENT" && (
              <span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-red-700">Urgent</span>
            )}
            <span>Date: {fmtDate(ref.date)}</span>
          </div>
        </div>

        {/* Addressee */}
        <div className="mt-4 text-sm text-slate-700">
          <p className="text-slate-400">To,</p>
          <p className="font-medium text-slate-800">{ref.referToName}</p>
          {ref.specialty && <p>{ref.specialty}</p>}
          {ref.referToFacility && <p>{ref.referToFacility}</p>}
        </div>

        {/* Patient */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-sm">
          <p><span className="text-slate-400">Patient:</span> <span className="font-medium">{patient.name}</span></p>
          <p><span className="text-slate-400">Age/Sex:</span> {ageGender(patient.age, patient.gender)}</p>
          <p><span className="text-slate-400">Phone:</span> {patient.phone}</p>
          {patient.abhaNumber && <p className="col-span-3"><span className="text-slate-400">ABHA:</span> {patient.abhaNumber}</p>}
        </div>

        {/* Body */}
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
          <p>{salutation}</p>
          <p>
            Thank you for seeing <span className="font-medium">{patient.name}</span>
            {patient.age ? `, a ${patient.age}-year-old ${patient.gender === "F" ? "woman" : patient.gender === "M" ? "man" : "patient"}` : ""}
            {ref.specialty ? `, whom I am referring for ${ref.specialty.toLowerCase()}` : ""}.
          </p>

          <div>
            <p className="font-semibold text-slate-800">Reason for referral</p>
            <p className="mt-1 whitespace-pre-line">{ref.reason}</p>
          </div>

          {ref.clinicalSummary && (
            <div>
              <p className="font-semibold text-slate-800">Clinical summary</p>
              <p className="mt-1 whitespace-pre-line">{ref.clinicalSummary}</p>
            </div>
          )}

          {ref.medications && (
            <div>
              <p className="font-semibold text-slate-800">Current medication</p>
              <p className="mt-1 whitespace-pre-line">{ref.medications}</p>
            </div>
          )}

          <p>
            I would be grateful for your opinion and further management. Please do not hesitate to contact me should you
            need any further information.
          </p>
          <p>With kind regards,</p>
        </div>

        {/* Signature */}
        <div className="mt-10 flex items-end justify-between">
          <p className="text-[10px] text-slate-400">This is a computer-generated referral letter issued by {clinic?.name}.</p>
          <div className="text-center">
            <div className="h-10 w-48 border-b border-slate-300"></div>
            <p className="mt-1 text-xs font-medium text-slate-700">{provider.name}</p>
            <p className="text-[11px] text-slate-500">{providerTitle}{regNo ? ` · ${regNo}` : ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
