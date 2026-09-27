import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BackLink, Avatar } from "@/components/ui";
import NewHepForm from "@/components/NewHepForm";
import { initials, ageGender } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NewHepPage({ params }: { params: { id: string } }) {
  const [patient, therapists] = await Promise.all([
    prisma.patient.findUnique({ where: { id: params.id } }),
    prisma.staff.findMany({ where: { role: "PHYSIO", active: true } }),
  ]);
  if (!patient) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <BackLink href={`/patients/${patient.id}/physio`}>← Back to physiotherapy</BackLink>
      </div>
      <div className="mb-5 flex items-center gap-3">
        <Avatar text={initials(patient.name)} className="h-12 w-12" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Home exercise program — {patient.name}</h1>
          <p className="text-sm text-slate-500">
            {ageGender(patient.age, patient.gender)} · pick exercises, then print or WhatsApp it to the patient
          </p>
        </div>
      </div>

      <div className="card p-5">
        <NewHepForm patientId={patient.id} therapists={therapists.map((t) => ({ id: t.id, name: t.name }))} />
      </div>
    </div>
  );
}
