import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/db";
import { recordPhysioSession, createPhysioPackage, sendMessage } from "@/app/actions";
import { PageHeader, Card, CardHeader, Badge, StatCard, EmptyState } from "@/components/ui";
import { inr, fmtDate } from "@/lib/format";
import { todayRange } from "@/lib/day";

export const dynamic = "force-dynamic";

export default async function PhysioPage() {
  const { start, end } = todayRange();
  const [packages, physios, patients, sessionsToday] = await Promise.all([
    prisma.physioPackage.findMany({ include: { patient: true }, orderBy: { purchaseDate: "desc" } }),
    prisma.staff.findMany({ where: { role: "PHYSIO", active: true } }),
    prisma.patient.findMany({ where: { softDeleted: false }, orderBy: { name: "asc" } }),
    prisma.physioSession.count({ where: { date: { gte: start, lte: end } } }),
  ]);

  const active = packages.filter((p) => p.status === "ACTIVE");
  const renewalsDue = packages.filter(
    (p) => p.status === "COMPLETED" || (p.status === "ACTIVE" && p.totalSessions - p.sessionsUsed <= 2)
  );

  const recordForm = (pkgId: string) => (
    <form action={recordPhysioSession} className="mt-3 flex items-end gap-2">
      <input type="hidden" name="packageId" value={pkgId} />
      <div className="w-20">
        <label className="label">Pain 0-10</label>
        <input name="painScore" type="number" min={0} max={10} className="input !py-1.5" placeholder="—" />
      </div>
      <div className="flex-1">
        <label className="label">Therapist</label>
        <select name="therapistId" className="input !py-1.5">
          {physios.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <button className="btn-primary btn-sm">Log session</button>
    </form>
  );

  const packageCard = (pkg: (typeof packages)[number]) => {
    const remaining = pkg.totalSessions - pkg.sessionsUsed;
    const pct = Math.round((pkg.sessionsUsed / pkg.totalSessions) * 100);
    const low = remaining <= 2 && pkg.status === "ACTIVE";
    return (
      <div key={pkg.id} className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/patients/${pkg.patientId}`} className="text-sm font-medium text-slate-800 hover:text-brand-700">
              {pkg.patient.name}
            </Link>
            <p className="text-xs text-slate-500">{pkg.name}</p>
          </div>
          <Badge className={pkg.status === "ACTIVE" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}>
            {pkg.status.toLowerCase()}
          </Badge>
        </div>
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>{pkg.sessionsUsed}/{pkg.totalSessions} sessions</span>
            <span>expires {fmtDate(pkg.expiryDate)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full ${low ? "bg-amber-400" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        {(low || pkg.status === "COMPLETED") && (
          <div className="mt-2 flex items-center justify-between rounded bg-amber-50 px-2 py-1.5">
            <span className="text-xs text-amber-700">
              {pkg.status === "COMPLETED" ? "Package complete — offer renewal" : `Only ${remaining} left — renewal due`}
            </span>
            <form action={sendMessage}>
              <input type="hidden" name="patientId" value={pkg.patientId} />
              <input type="hidden" name="type" value="RECALL" />
              <input type="hidden" name="detail" value={`Your ${pkg.name} is running low.`} />
              <button className="btn-ghost btn-sm">
                <Bell size={13} /> Remind
              </button>
            </form>
          </div>
        )}
        {pkg.status === "ACTIVE" && remaining > 0 && recordForm(pkg.id)}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Physiotherapy" subtitle="Session packages, progress & renewals" />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active packages" value={active.length} accent="text-brand-600" />
        <StatCard label="Renewals due" value={renewalsDue.length} accent="text-amber-600" />
        <StatCard label="Sessions today" value={sessionsToday} />
        <StatCard label="Therapists" value={physios.length} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Renewals due" subtitle="Low-balance & completed packages — recover this revenue" />
          {renewalsDue.length === 0 ? (
            <EmptyState>No renewals due.</EmptyState>
          ) : (
            <div className="divide-y divide-slate-100">{renewalsDue.map(packageCard)}</div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Sell new package"
            subtitle="Create a multi-session package"
          />
          <form action={createPhysioPackage} className="grid grid-cols-2 gap-3 p-5">
            <div className="col-span-2">
              <label className="label">Patient</label>
              <select name="patientId" required className="input">
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.phone}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Package name</label>
              <input name="name" className="input" defaultValue="Knee Rehabilitation — 10 sessions" />
            </div>
            <div>
              <label className="label">Total sessions</label>
              <input name="totalSessions" type="number" min={1} className="input" defaultValue={10} />
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input name="price" type="number" min={0} className="input" defaultValue={3500} />
            </div>
            <div className="col-span-2 flex justify-end">
              <button className="btn-primary">Create package</button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="All packages" subtitle={`${packages.length} total`} />
        {packages.length === 0 ? (
          <EmptyState>No packages yet.</EmptyState>
        ) : (
          <div className="grid gap-0 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0 md:[&>*:nth-child(odd)]:border-r md:[&>*]:border-b md:[&>*]:border-slate-100">
            {packages.map(packageCard)}
          </div>
        )}
      </Card>
    </div>
  );
}
