import Link from "next/link";
import { Play, Check, Ban, FileText, Bell, Eye } from "lucide-react";
import { prisma } from "@/lib/db";
import { updateApptStatus, sendMessage, markRequestHandled } from "@/app/actions";
import { PageHeader, StatCard, Card, CardHeader, Badge, Avatar, EmptyState } from "@/components/ui";
import RegisterWalkInForm from "@/components/RegisterWalkInForm";
import { inr, fmtTime, fmtDateTime, initials, ageGender } from "@/lib/format";
import { STATUS_LABELS, STATUS_BADGE, SERVICE_LABELS, SOURCE_LABELS, PATIENT_RESPONSE_LABELS } from "@/lib/constants";
import { todayRange } from "@/lib/day";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const { start, end } = todayRange();

  const [providers, appts, payments, requests] = await Promise.all([
    prisma.staff.findMany({ where: { isProvider: true, active: true }, orderBy: { role: "asc" } }),
    prisma.appointment.findMany({
      where: { scheduledStart: { gte: start, lte: end } },
      include: { patient: true, provider: true },
      orderBy: [{ tokenNo: "asc" }, { scheduledStart: "asc" }],
    }),
    prisma.payment.findMany({ where: { paidAt: { gte: start, lte: end } } }),
    // F-03: patient-initiated reschedule/cancel requests awaiting the desk (any date)
    prisma.appointment.findMany({
      where: { patientResponse: { in: ["RESCHEDULE", "CANCELLED"] }, requestHandled: false },
      include: { patient: true, provider: true },
      orderBy: { respondedAt: "desc" },
    }),
  ]);

  const waiting = appts.filter((a) => a.status === "CHECKED_IN").length;
  const inConsult = appts.filter((a) => a.status === "IN_PROGRESS").length;
  const done = appts.filter((a) => a.status === "COMPLETED").length;
  const noShows = appts.filter((a) => a.status === "NO_SHOW").length;
  const collections = payments.reduce((s, p) => s + p.amount, 0);

  const byProvider = providers.map((p) => ({
    provider: p,
    rows: appts.filter((a) => a.providerId === p.id),
  }));

  return (
    <div>
      <PageHeader
        title="Today's Queue"
        subtitle="Live walk-in & appointment queue across all providers"
        action={<RegisterWalkInForm providers={providers.map((p) => ({ id: p.id, name: p.name, role: p.role }))} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Waiting" value={waiting} accent="text-amber-600" />
        <StatCard label="In consult" value={inConsult} accent="text-brand-600" />
        <StatCard label="Done today" value={done} accent="text-green-600" />
        <StatCard label="No-shows" value={noShows} accent="text-red-600" />
        <StatCard label="Collected today" value={inr(collections)} accent="text-slate-900" />
      </div>

      {requests.length > 0 && (
        <Card className="mb-6 border-amber-200">
          <CardHeader
            title={`Reschedule & cancellation requests (${requests.length})`}
            subtitle="Patients responded via their WhatsApp link — call to rebook or refill the freed slot"
          />
          <div className="divide-y divide-slate-100">
            {requests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/patients/${r.patientId}`} className="text-sm font-medium text-slate-800 hover:text-brand-700">
                      {r.patient.name}
                    </Link>
                    <Badge className={r.patientResponse === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}>
                      {PATIENT_RESPONSE_LABELS[r.patientResponse ?? ""] ?? r.patientResponse}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {fmtDateTime(r.scheduledStart)} · {r.provider.name} · {r.patient.phone}
                  </p>
                  {r.responseNote && <p className="mt-0.5 text-xs text-slate-600">“{r.responseNote}”</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <Link href={`/patients/${r.patientId}`} className="btn-ghost btn-sm">
                    <Eye size={14} /> Patient
                  </Link>
                  <form action={markRequestHandled}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="btn-primary btn-sm">
                      <Check size={14} /> Mark handled
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {byProvider.map(({ provider, rows }) => (
          <Card key={provider.id}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-3">
                <Avatar text={initials(provider.name)} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{provider.name}</p>
                  <p className="text-xs text-slate-500">
                    {provider.role === "OWNER_DOCTOR" ? "Orthopaedics" : "Physiotherapy"} ·{" "}
                    {rows.filter((r) => ["CHECKED_IN", "IN_PROGRESS", "BOOKED", "CONFIRMED"].includes(r.status)).length}{" "}
                    in queue
                  </p>
                </div>
              </div>
            </div>

            {rows.length === 0 ? (
              <EmptyState>No patients in the queue yet.</EmptyState>
            ) : (
              <div className="divide-y divide-slate-100">
                {rows.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                        {a.tokenNo ?? "—"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/patients/${a.patientId}`} className="text-sm font-medium text-slate-800 hover:text-brand-700">
                          {a.patient.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {ageGender(a.patient.age, a.patient.gender)} · {a.patient.phone}
                        </p>
                        {a.reason ? <p className="mt-0.5 text-xs text-slate-400">{a.reason}</p> : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-12 sm:gap-3 sm:pl-0">
                      <div className="hidden w-24 text-xs text-slate-500 sm:block">{fmtTime(a.scheduledStart)}</div>
                      <Badge className="bg-slate-100 text-slate-600">{SERVICE_LABELS[a.serviceType]}</Badge>
                      <span className="hidden text-[11px] text-slate-400 md:inline">{SOURCE_LABELS[a.source]}</span>
                      <Badge className={STATUS_BADGE[a.status]}>{STATUS_LABELS[a.status]}</Badge>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {(a.status === "BOOKED" || a.status === "CONFIRMED") && (
                          <>
                            <StatusButton id={a.id} status="CHECKED_IN" label="Check in" />
                            <form action={sendMessage}>
                              <input type="hidden" name="patientId" value={a.patientId} />
                              <input type="hidden" name="appointmentId" value={a.id} />
                              <input type="hidden" name="type" value="REMINDER_2H" />
                              <button className="btn-ghost btn-sm" title="Send WhatsApp reminder">
                                <Bell size={14} /> Remind
                              </button>
                            </form>
                          </>
                        )}
                        {a.status === "CHECKED_IN" && (
                          <>
                            <StatusButton id={a.id} status="IN_PROGRESS" label="Start" icon="play" />
                            <StatusButton id={a.id} status="NO_SHOW" label="No-show" icon="ban" ghost />
                          </>
                        )}
                        {a.status === "IN_PROGRESS" && (
                          <>
                            <Link
                              href={`/patients/${a.patientId}/visit?apptId=${a.id}&providerId=${a.providerId}`}
                              className="btn-primary btn-sm"
                            >
                              <FileText size={14} /> New visit
                            </Link>
                            <StatusButton id={a.id} status="COMPLETED" label="Done" icon="check" ghost />
                          </>
                        )}
                        {a.status === "COMPLETED" && (
                          <Link href={`/patients/${a.patientId}`} className="btn-ghost btn-sm">
                            <Eye size={14} /> View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusButton({
  id,
  status,
  label,
  icon,
  ghost,
}: {
  id: string;
  status: string;
  label: string;
  icon?: "play" | "check" | "ban";
  ghost?: boolean;
}) {
  return (
    <form action={updateApptStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`${ghost ? "btn-ghost" : "btn-primary"} btn-sm`}>
        {icon === "play" && <Play size={14} />}
        {icon === "check" && <Check size={14} />}
        {icon === "ban" && <Ban size={14} />}
        {label}
      </button>
    </form>
  );
}
