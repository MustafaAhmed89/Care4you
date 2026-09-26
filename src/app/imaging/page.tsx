import Link from "next/link";
import { Share2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { shareStudy } from "@/app/actions";
import { PageHeader, Card, CardHeader, Badge, StatCard, EmptyState } from "@/components/ui";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ImagingPage() {
  const studies = await prisma.imagingStudy.findMany({
    include: { patient: true },
    orderBy: { studyDate: "desc" },
  });

  const pending = studies.filter((s) => s.reportStatus === "PENDING").length;
  const ready = studies.filter((s) => s.reportStatus === "READY").length;
  const shared = studies.filter((s) => s.reportStatus === "SHARED").length;

  return (
    <div>
      <PageHeader title="X-ray / Imaging" subtitle="In-house studies — phone-photo capture, no PACS needed" />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Pending report" value={pending} accent="text-amber-600" />
        <StatCard label="Ready" value={ready} accent="text-blue-600" />
        <StatCard label="Shared with patient" value={shared} accent="text-green-600" />
      </div>

      <Card>
        <CardHeader title="All studies" subtitle="Add or attach a study from the patient's profile" />
        {studies.length === 0 ? (
          <EmptyState>No imaging studies yet.</EmptyState>
        ) : (
          <div className="divide-y divide-slate-100">
            {studies.map((s) => (
              <div key={s.id} className="flex items-start gap-4 p-5">
                {s.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.imagePath} alt={s.bodyPart} className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-slate-200 text-[10px] text-slate-400">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/patients/${s.patientId}`} className="text-sm font-medium text-slate-800 hover:text-brand-700">
                      {s.patient.name}
                    </Link>
                    <span className="text-sm text-slate-500">· {s.bodyPart}</span>
                    {s.view && <span className="text-xs text-slate-400">{s.view}</span>}
                    <Badge
                      className={
                        s.reportStatus === "SHARED"
                          ? "bg-green-100 text-green-700"
                          : s.reportStatus === "READY"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {s.reportStatus.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{fmtDate(s.studyDate)}</p>
                  {s.reportText && <p className="mt-1 text-sm text-slate-600">{s.reportText}</p>}
                </div>
                {s.reportStatus !== "SHARED" && (
                  <form action={shareStudy}>
                    <input type="hidden" name="studyId" value={s.id} />
                    <button className="btn-ghost btn-sm">
                      <Share2 size={13} /> Share on WhatsApp
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
