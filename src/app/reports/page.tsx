import { prisma } from "@/lib/db";
import { PageHeader, Card, CardHeader, StatCard } from "@/components/ui";
import { inr } from "@/lib/format";
import { format, subDays } from "date-fns";
import { SERVICE_LABELS } from "@/lib/constants";
import { todayRange } from "@/lib/day";

export const dynamic = "force-dynamic";

const ITEM_LABELS: Record<string, string> = {
  CONSULT: "Consultations",
  XRAY: "X-ray / Imaging",
  PHYSIO: "Physiotherapy",
  PROCEDURE: "Procedures",
  PHARMACY: "Pharmacy",
  OTHER: "Other",
};

export default async function ReportsPage() {
  const { start, end } = todayRange();
  const weekAgo = subDays(start, 6);

  const [apptsToday, weekPayments, invoices, packages] = await Promise.all([
    prisma.appointment.findMany({ where: { scheduledStart: { gte: start, lte: end } } }),
    prisma.payment.findMany({ where: { paidAt: { gte: weekAgo } }, include: { invoice: { include: { lines: true } } } }),
    prisma.invoice.findMany({ include: { lines: true, payments: true } }),
    prisma.physioPackage.findMany(),
  ]);

  const collectedToday = weekPayments
    .filter((p) => p.paidAt >= start && p.paidAt <= end)
    .reduce((s, p) => s + p.amount, 0);

  const decided = apptsToday.filter((a) => ["COMPLETED", "NO_SHOW"].includes(a.status));
  const noShows = apptsToday.filter((a) => a.status === "NO_SHOW").length;
  const noShowRate = decided.length ? Math.round((noShows / decided.length) * 100) : 0;

  const dues = invoices.reduce((s, inv) => {
    const total = inv.lines.reduce((a, l) => a + l.lineTotal, 0);
    const paid = inv.payments.reduce((a, p) => a + p.amount, 0);
    return s + Math.max(0, total - paid);
  }, 0);

  const renewalsDue = packages.filter(
    (p) => p.status === "COMPLETED" || (p.status === "ACTIVE" && p.totalSessions - p.sessionsUsed <= 2)
  ).length;

  // Revenue by service line (all invoiced amounts)
  const revByType: Record<string, number> = {};
  for (const inv of invoices) for (const l of inv.lines) revByType[l.itemType] = (revByType[l.itemType] || 0) + l.lineTotal;
  const revEntries = Object.entries(revByType).sort((a, b) => b[1] - a[1]);
  const revMax = Math.max(1, ...revEntries.map(([, v]) => v));

  // Collections last 7 days
  const days: { label: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(start, i);
    const dStart = new Date(d);
    dStart.setHours(0, 0, 0, 0);
    const dEnd = new Date(d);
    dEnd.setHours(23, 59, 59, 999);
    const total = weekPayments.filter((p) => p.paidAt >= dStart && p.paidAt <= dEnd).reduce((s, p) => s + p.amount, 0);
    days.push({ label: format(d, "EEE"), total });
  }
  const dayMax = Math.max(1, ...days.map((d) => d.total));

  return (
    <div>
      <PageHeader title="Owner Dashboard" subtitle="How the clinic is doing — at a glance" />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Collected today" value={inr(collectedToday)} accent="text-green-600" />
        <StatCard label="Appointments today" value={apptsToday.length} />
        <StatCard label="No-show rate" value={`${noShowRate}%`} accent={noShowRate > 15 ? "text-red-600" : "text-slate-900"} hint="today" />
        <StatCard label="Outstanding dues" value={inr(dues)} accent="text-red-600" />
        <StatCard label="Renewals due" value={renewalsDue} accent="text-amber-600" />
        <StatCard label="Bills raised" value={invoices.length} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Revenue by service line" subtitle="All invoiced amounts" />
          <div className="space-y-3 p-5">
            {revEntries.length === 0 ? (
              <p className="text-sm text-slate-400">No revenue recorded.</p>
            ) : (
              revEntries.map(([type, val]) => (
                <div key={type}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-600">{ITEM_LABELS[type] || type}</span>
                    <span className="font-medium text-slate-800">{inr(val)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(val / revMax) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Collections — last 7 days" />
          <div className="flex items-end justify-between gap-2 p-5" style={{ height: 220 }}>
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-slate-500">{d.total ? inr(d.total) : ""}</span>
                <div
                  className="w-full rounded-t bg-brand-400"
                  style={{ height: `${Math.max(4, (d.total / dayMax) * 150)}px` }}
                  title={inr(d.total)}
                />
                <span className="text-[11px] text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
