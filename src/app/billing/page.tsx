import Link from "next/link";
import { prisma } from "@/lib/db";
import { addPayment } from "@/app/actions";
import { PageHeader, Card, CardHeader, Badge, StatCard, EmptyState } from "@/components/ui";
import { inr, fmtDate } from "@/lib/format";
import { STATUS_BADGE } from "@/lib/constants";

export const dynamic = "force-dynamic";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default async function BillingPage() {
  const { start, end } = todayRange();
  const [todayPayments, invoices] = await Promise.all([
    prisma.payment.findMany({ where: { paidAt: { gte: start, lte: end } }, include: { invoice: { include: { patient: true } } } }),
    prisma.invoice.findMany({ include: { lines: true, payments: true, patient: true }, orderBy: { date: "desc" }, take: 40 }),
  ]);

  const byMode = { CASH: 0, UPI: 0, CARD: 0 } as Record<string, number>;
  for (const p of todayPayments) byMode[p.mode] = (byMode[p.mode] || 0) + p.amount;
  const totalToday = byMode.CASH + byMode.UPI + byMode.CARD;

  const dueInvoices = invoices
    .map((inv) => {
      const total = inv.lines.reduce((s, l) => s + l.lineTotal, 0);
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      return { inv, total, paid, balance: total - paid };
    })
    .filter((x) => x.balance > 0);
  const totalDues = dueInvoices.reduce((s, x) => s + x.balance, 0);

  return (
    <div>
      <PageHeader title="Billing" subtitle="Day-end reconciliation, dues & invoices" />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Collected today" value={inr(totalToday)} accent="text-green-600" hint={`${todayPayments.length} payments`} />
        <StatCard label="Cash" value={inr(byMode.CASH)} />
        <StatCard label="UPI" value={inr(byMode.UPI)} />
        <StatCard label="Card" value={inr(byMode.CARD)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Day-end reconciliation */}
        <Card className="lg:col-span-2">
          <CardHeader title="Day-end reconciliation" subtitle="Match this against your cash drawer & UPI/card statements" />
          {todayPayments.length === 0 ? (
            <EmptyState>No collections recorded today yet.</EmptyState>
          ) : (
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="th">Time / Patient</th>
                  <th className="th">Mode</th>
                  <th className="th text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="td">
                      <Link href={`/patients/${p.invoice.patientId}`} className="font-medium text-slate-700 hover:text-brand-700">
                        {p.invoice.patient.name}
                      </Link>
                    </td>
                    <td className="td">
                      <Badge className="bg-slate-100 text-slate-600">{p.mode}</Badge>
                    </td>
                    <td className="td text-right font-medium">{inr(p.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold">
                  <td className="td">Total</td>
                  <td className="td"></td>
                  <td className="td text-right">{inr(totalToday)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </Card>

        {/* Dues */}
        <Card>
          <CardHeader title="Outstanding dues" subtitle={totalDues > 0 ? `${inr(totalDues)} across ${dueInvoices.length}` : "All settled"} />
          {dueInvoices.length === 0 ? (
            <EmptyState>No outstanding dues 🎉</EmptyState>
          ) : (
            <div className="divide-y divide-slate-100">
              {dueInvoices.map(({ inv, balance }) => (
                <div key={inv.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <Link href={`/patients/${inv.patientId}`} className="text-sm font-medium text-slate-700 hover:text-brand-700">
                      {inv.patient.name}
                    </Link>
                    <span className="text-sm font-semibold text-red-600">{inr(balance)}</span>
                  </div>
                  <form action={addPayment} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="invoiceId" value={inv.id} />
                    <input name="amount" type="number" min={1} defaultValue={balance} className="input !py-1.5 w-24" />
                    <select name="mode" className="input !py-1.5 w-20">
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="CARD">Card</option>
                    </select>
                    <button className="btn-ghost btn-sm">Collect</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent invoices */}
      <Card className="mt-5">
        <CardHeader title="Recent invoices" />
        <table className="w-full">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <th className="th">Date</th>
              <th className="th">Patient</th>
              <th className="th">Items</th>
              <th className="th text-right">Total</th>
              <th className="th">Status</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const total = inv.lines.reduce((s, l) => s + l.lineTotal, 0);
              return (
                <tr key={inv.id} className="hover:bg-slate-50/60">
                  <td className="td">{fmtDate(inv.date)}</td>
                  <td className="td">
                    <Link href={`/patients/${inv.patientId}`} className="font-medium text-slate-700 hover:text-brand-700">
                      {inv.patient.name}
                    </Link>
                  </td>
                  <td className="td text-slate-500">{inv.lines.map((l) => l.description).join(", ")}</td>
                  <td className="td text-right font-medium">{inr(total)}</td>
                  <td className="td">
                    <Badge className={STATUS_BADGE[inv.status] || "bg-slate-100 text-slate-600"}>{inv.status.toLowerCase()}</Badge>
                  </td>
                  <td className="td text-right">
                    <Link href={`/receipt/${inv.id}`} target="_blank" className="text-sm text-brand-700 hover:underline">
                      Receipt
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
