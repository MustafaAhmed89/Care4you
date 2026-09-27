import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireResource } from "@/lib/session";
import { BackLink, Avatar } from "@/components/ui";
import NewReferralForm from "@/components/NewReferralForm";
import { initials, ageGender, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NewReferralPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { providerId?: string; visitId?: string };
}) {
  await requireResource("referral");
  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient) notFound();

  let providerId = searchParams.providerId;
  if (!providerId) {
    const doctor = await prisma.staff.findFirst({ where: { role: "OWNER_DOCTOR" } });
    providerId = doctor?.id;
  }
  if (!providerId) notFound();

  // Prefill from the linked visit (if provided) or the most recent visit.
  const visit = searchParams.visitId
    ? await prisma.visit.findUnique({
        where: { id: searchParams.visitId },
        include: { prescription: { include: { lines: true } } },
      })
    : await prisma.visit.findFirst({
        where: { patientId: patient.id },
        orderBy: { date: "desc" },
        include: { prescription: { include: { lines: true } } },
      });

  const defaultReason = visit?.diagnosis || "";
  const summaryParts: string[] = [];
  if (visit) {
    if (visit.complaint) summaryParts.push(`Presenting complaint: ${visit.complaint}`);
    if (visit.injurySite) summaryParts.push(`Site: ${visit.injurySite}${visit.injurySide && visit.injurySide !== "NA" ? ` (${visit.injurySide.toLowerCase()})` : ""}`);
    if (visit.diagnosis) summaryParts.push(`Working diagnosis: ${visit.diagnosis}`);
    if (visit.plan) summaryParts.push(`Management so far: ${visit.plan}`);
  }
  const defaultSummary = summaryParts.join("\n");
  const defaultMedications = (visit?.prescription?.lines || [])
    .map((l) => `${l.genericName}${l.brandName ? ` (${l.brandName})` : ""}${l.dose ? ` ${l.dose}` : ""}${l.frequency ? `, ${l.frequency}` : ""}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <BackLink href={`/patients/${patient.id}`}>← Back to patient</BackLink>
      </div>
      <div className="mb-5 flex items-center gap-3">
        <Avatar text={initials(patient.name)} className="h-12 w-12" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Refer {patient.name}</h1>
          <p className="text-sm text-slate-500">
            {ageGender(patient.age, patient.gender)} · {patient.phone}
            {visit ? ` · prefilled from visit ${fmtDate(visit.date)}` : ""}
          </p>
        </div>
      </div>

      <NewReferralForm
        patientId={patient.id}
        providerId={providerId}
        visitId={visit?.id}
        defaultReason={defaultReason}
        defaultSummary={defaultSummary}
        defaultMedications={defaultMedications}
      />
    </div>
  );
}
