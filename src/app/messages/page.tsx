import { MessageCircle, Check, CheckCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/app/actions";
import { PageHeader, Card, CardHeader, StatCard, EmptyState } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { MESSAGE_TYPE_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const [messages, patients] = await Promise.all([
    prisma.message.findMany({ include: { patient: true }, orderBy: { createdAt: "desc" }, take: 60 }),
    prisma.patient.findMany({ where: { softDeleted: false }, orderBy: { name: "asc" } }),
  ]);

  const delivered = messages.filter((m) => m.status === "DELIVERED" || m.status === "READ").length;
  const readCount = messages.filter((m) => m.status === "READ").length;

  return (
    <div>
      <PageHeader title="WhatsApp Outbox" subtitle="Confirmations, reminders & report shares" />

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
        <strong>Demo mode:</strong> messages are generated from real utility templates and simulated as delivered. To send
        for real, connect a WhatsApp BSP (AiSensy / Interakt / Wati / Gupshup) and set <code>MESSAGING_PROVIDER=bsp</code>.
        See requirements §14.
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Messages" value={messages.length} />
        <StatCard label="Delivered" value={delivered} accent="text-green-600" />
        <StatCard label="Read" value={readCount} accent="text-blue-600" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent messages" />
          {messages.length === 0 ? (
            <EmptyState>No messages yet.</EmptyState>
          ) : (
            <div className="space-y-3 bg-[#e9f1ec] p-4">
              {messages.map((m) => (
                <div key={m.id} className="ml-auto max-w-md">
                  <div className="rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-3 py-2 shadow-sm">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-brand-800">{m.patient.name}</span>
                      <span className="text-[10px] text-slate-500">{MESSAGE_TYPE_LABELS[m.type] || m.type}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-[13px] leading-snug text-slate-800">{m.body}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                      <span>{fmtDateTime(m.sentAt || m.createdAt)}</span>
                      {m.status === "READ" ? (
                        <CheckCheck size={13} className="text-blue-500" />
                      ) : m.status === "DELIVERED" ? (
                        <CheckCheck size={13} className="text-slate-400" />
                      ) : m.status === "SENT" ? (
                        <Check size={13} className="text-slate-400" />
                      ) : (
                        <span className="text-red-500">failed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Send a message" subtitle="Pick a patient & template" />
          <form action={sendMessage} className="space-y-3 p-5">
            <div>
              <label className="label">Patient</label>
              <select name="patientId" required className="input">
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Template</label>
              <select name="type" className="input" defaultValue="RECALL">
                <option value="CONFIRM">Booking confirmation</option>
                <option value="REMINDER_24H">24-hour reminder</option>
                <option value="REMINDER_2H">2-hour reminder</option>
                <option value="RECALL">Follow-up recall</option>
                <option value="DUES">Payment reminder</option>
              </select>
            </div>
            <div>
              <label className="label">Detail (optional)</label>
              <input name="detail" className="input" placeholder="e.g. amount / note" />
            </div>
            <button className="btn-primary w-full">
              <MessageCircle size={16} /> Send on WhatsApp
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
