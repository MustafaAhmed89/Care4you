import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireResource } from "@/lib/session";
import PrintButton from "@/components/PrintButton";
import { BackLink } from "@/components/ui";
import { inr, fmtDate, fmtDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { invoiceId: string } }) {
  await requireResource("billing");
  const [inv, clinic] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: { lines: true, payments: true, patient: true },
    }),
    prisma.clinic.findFirst(),
  ]);
  if (!inv) notFound();

  const subtotal = inv.lines.reduce((s, l) => s + l.lineTotal, 0);
  const taxTotal = inv.lines.reduce((s, l) => (l.gstExempt ? s : s + Math.round((l.lineTotal * l.gstRate) / 100)), 0);
  const grand = subtotal + taxTotal;
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
  const balance = grand - paid;
  const hasTaxable = inv.lines.some((l) => !l.gstExempt);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <BackLink href={`/patients/${inv.patientId}`}>← Back to patient</BackLink>
        <PrintButton label="Print receipt" />
      </div>

      <div className="print-area rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="flex items-start justify-between border-b-2 border-brand-600 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">
              {clinic?.logoInitials}
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{clinic?.name}</h1>
              <p className="text-xs text-slate-500">{clinic?.address}</p>
              {clinic?.gstRegistered && clinic?.gstin && <p className="text-xs text-slate-500">GSTIN: {clinic.gstin}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">RECEIPT</p>
            <p className="text-xs text-slate-500">#{inv.id.slice(-6).toUpperCase()}</p>
            <p className="text-xs text-slate-500">{fmtDate(inv.date)}</p>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <p><span className="text-slate-400">Patient:</span> <span className="font-medium">{inv.patient.name}</span> · {inv.patient.phone}</p>
        </div>

        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Rate</th>
              {hasTaxable && <th className="py-2 text-right">GST</th>}
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.lines.map((l) => (
              <tr key={l.id} className="border-b border-slate-100">
                <td className="py-2.5">
                  {l.description}
                  {l.gstExempt && <span className="ml-1 text-[10px] text-slate-400">(GST-exempt)</span>}
                </td>
                <td className="py-2.5 text-center text-slate-600">{l.qty}</td>
                <td className="py-2.5 text-right text-slate-600">{inr(l.unitPrice)}</td>
                {hasTaxable && (
                  <td className="py-2.5 text-right text-slate-600">{l.gstExempt ? "—" : `${l.gstRate}%`}</td>
                )}
                <td className="py-2.5 text-right font-medium text-slate-800">{inr(l.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-56 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{inr(subtotal)}</span>
          </div>
          {hasTaxable && (
            <div className="flex justify-between text-slate-600">
              <span>GST</span>
              <span>{inr(taxTotal)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{inr(grand)}</span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Paid</span>
            <span>{inr(paid)}</span>
          </div>
          {balance > 0 && (
            <div className="flex justify-between font-medium text-red-600">
              <span>Balance due</span>
              <span>{inr(balance)}</span>
            </div>
          )}
        </div>

        {inv.payments.length > 0 && (
          <div className="mt-4 text-xs text-slate-500">
            Payments: {inv.payments.map((p) => `${inr(p.amount)} (${p.mode})`).join(", ")}
          </div>
        )}

        <p className="mt-6 border-t border-slate-100 pt-3 text-center text-[11px] text-slate-400">
          {clinic?.gstRegistered
            ? "Consultation & diagnostic services are exempt from GST; taxable items shown above."
            : "Healthcare services are exempt from GST. Thank you for visiting."}
        </p>
      </div>
    </div>
  );
}
