import Link from "next/link";
import { Share2, ScanLine, ShieldCheck, X } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireResource } from "@/lib/session";
import { shareStudy, cancelImagingOrder } from "@/app/actions";
import { PageHeader, Card, CardHeader, Badge, StatCard, EmptyState } from "@/components/ui";
import NewImagingOrderForm from "@/components/NewImagingOrderForm";
import CaptureStudyForm from "@/components/CaptureStudyForm";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function sideLabel(side?: string | null) {
  if (!side || side === "NA") return "";
  return side === "LEFT" ? "Left" : side === "RIGHT" ? "Right" : side;
}

export default async function ImagingPage() {
  await requireResource("imaging");
  const [clinic, orders, studies, patients, providers, staff] = await Promise.all([
    prisma.clinic.findFirst(),
    prisma.imagingOrder.findMany({
      where: { status: "ORDERED" },
      include: { patient: true, orderedBy: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.imagingStudy.findMany({
      include: { patient: true, operator: true },
      orderBy: { studyDate: "desc" },
      take: 50,
    }),
    prisma.patient.findMany({ where: { softDeleted: false }, orderBy: { name: "asc" } }),
    prisma.staff.findMany({ where: { isProvider: true, active: true }, orderBy: { role: "asc" } }),
    prisma.staff.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const pending = studies.filter((s) => s.reportStatus === "PENDING").length;
  const ready = studies.filter((s) => s.reportStatus === "READY").length;
  const shared = studies.filter((s) => s.reportStatus === "SHARED").length;

  const renewal = clinic?.aerbRenewal ? new Date(clinic.aerbRenewal) : null;
  const days = renewal ? Math.ceil((renewal.getTime() - Date.now()) / 86400000) : null;
  const renewalBadge =
    days == null
      ? { cls: "bg-slate-100 text-slate-500", text: "renewal not set" }
      : days < 0
      ? { cls: "bg-red-100 text-red-700", text: `expired ${-days}d ago` }
      : days <= 90
      ? { cls: "bg-amber-100 text-amber-800", text: `renew in ${days}d` }
      : { cls: "bg-green-100 text-green-700", text: `valid · ${days}d left` };

  return (
    <div>
      <PageHeader title="X-ray / Imaging" subtitle="Order worklist, phone-photo capture & AERB register — no PACS needed" />

      {/* AERB compliance banner (F-12) */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">AERB radiation compliance</p>
              <p className="text-xs text-slate-500">
                Licence {clinic?.aerbLicenceNo || "—"} · RSO {clinic?.aerbRso || "—"} · renewal{" "}
                {renewal ? fmtDate(renewal) : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={renewalBadge.cls}>{renewalBadge.text}</Badge>
            <Link href="/imaging/register" target="_blank" className="btn-ghost btn-sm">
              View / print register
            </Link>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Worklist" value={orders.length} accent="text-brand-600" />
        <StatCard label="Pending report" value={pending} accent="text-amber-600" />
        <StatCard label="Ready" value={ready} accent="text-blue-600" />
        <StatCard label="Shared" value={shared} accent="text-green-600" />
      </div>

      {/* Technician worklist (F-09) */}
      <Card className="mb-6">
        <CardHeader title="Technician worklist" subtitle="Ordered studies awaiting capture" />
        {orders.length === 0 ? (
          <EmptyState>No pending orders. Place one below.</EmptyState>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-start gap-3 p-5">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <ScanLine size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/patients/${o.patientId}`} className="text-sm font-medium text-slate-800 hover:text-brand-700">
                      {o.patient.name}
                    </Link>
                    <span className="text-sm text-slate-600">
                      {o.region}
                      {sideLabel(o.side) ? ` (${sideLabel(o.side)})` : ""}
                    </span>
                    {o.view && <Badge className="bg-slate-100 text-slate-600">{o.view}</Badge>}
                  </div>
                  <p className="text-xs text-slate-500">
                    Ordered by {o.orderedBy.name} · {fmtDate(o.createdAt)}
                    {o.note ? ` · ${o.note}` : ""}
                  </p>
                  <CaptureStudyForm orderId={o.id} operators={staff.map((s) => ({ id: s.id, name: s.name }))} />
                </div>
                <form action={cancelImagingOrder}>
                  <input type="hidden" name="id" value={o.id} />
                  <button className="btn-ghost btn-sm text-slate-400">
                    <X size={14} /> Cancel
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Place order */}
        <Card>
          <CardHeader title="Place imaging order" subtitle="Region · view · side — lands in the worklist" />
          <NewImagingOrderForm
            patients={patients.map((p) => ({ id: p.id, name: p.name, phone: p.phone }))}
            doctors={providers.map((d) => ({ id: d.id, name: d.name }))}
          />
        </Card>

        {/* Study log */}
        <Card>
          <CardHeader
            title="Study log"
            subtitle={`${studies.length} recent`}
            action={
              <Link href="/imaging/register" target="_blank" className="text-sm font-medium text-brand-700 hover:underline">
                Full register →
              </Link>
            }
          />
          {studies.length === 0 ? (
            <EmptyState>No studies yet.</EmptyState>
          ) : (
            <div className="divide-y divide-slate-100">
              {studies.slice(0, 8).map((s) => (
                <div key={s.id} className="flex items-start gap-3 p-4">
                  {s.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imagePath} alt={s.bodyPart} className="h-14 w-14 rounded border border-slate-200 object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded border border-dashed border-slate-200 text-[9px] text-slate-400">
                      No image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/patients/${s.patientId}`} className="text-sm font-medium text-slate-800 hover:text-brand-700">
                        {s.patient.name}
                      </Link>
                      <span className="text-xs text-slate-500">
                        {s.bodyPart}
                        {s.view ? ` · ${s.view}` : ""}
                      </span>
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
                    <p className="text-[11px] text-slate-400">
                      {fmtDate(s.studyDate)}
                      {s.machineModel ? ` · ${s.machineModel}` : ""}
                      {s.kvp ? ` · ${s.kvp} kVp` : ""}
                      {s.mas ? `/${s.mas} mAs` : ""}
                    </p>
                  </div>
                  {s.reportStatus !== "SHARED" && (
                    <form action={shareStudy}>
                      <input type="hidden" name="studyId" value={s.id} />
                      <button className="btn-ghost btn-sm">
                        <Share2 size={13} /> Share
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
