import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, BackLink, Avatar } from "@/components/ui";
import NewVisitForm from "@/components/NewVisitForm";
import { initials, ageGender } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { providerId?: string; apptId?: string };
}) {
  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient) notFound();

  let providerId = searchParams.providerId;
  if (!providerId) {
    const doctor = await prisma.staff.findFirst({ where: { role: "OWNER_DOCTOR" } });
    providerId = doctor?.id;
  }
  const provider = providerId ? await prisma.staff.findUnique({ where: { id: providerId } }) : null;
  if (!provider) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <BackLink href={`/patients/${patient.id}`}>← Back to patient</BackLink>
      </div>
      <div className="mb-5 flex items-center gap-3">
        <Avatar text={initials(patient.name)} className="h-12 w-12" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{patient.name}</h1>
          <p className="text-sm text-slate-500">
            {ageGender(patient.age, patient.gender)} · {patient.phone}
          </p>
        </div>
      </div>

      <NewVisitForm
        patientId={patient.id}
        providerId={provider.id}
        appointmentId={searchParams.apptId}
        providerName={provider.name}
      />
    </div>
  );
}
