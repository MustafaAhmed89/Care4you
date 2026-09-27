import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Printer, Share2, Bell, Stethoscope, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireResource } from "@/lib/session";
import { addPayment, recordPhysioSession, shareStudy, sendMessage } from "@/app/actions";
import { Card, CardHeader, Badge, Avatar, EmptyState, BackLink } from "@/components/ui";
import UploadStudyForm from "@/components/UploadStudyForm";
import NewInvoiceForm from "@/components/NewInvoiceForm";
import { inr, fmtDate, fmtDateTime, initials, ageGender } from "@/lib/format";
import { STATUS_BADGE, MESSAGE_TYPE_LABELS, SCHEDULE_FLAG_LABELS, REFERRAL_URGENCY_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PatientPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string };
}) {
  await requireResource("patients");
  const [patient, doctor, physios] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        visits: { orderBy: { date: "desc" }, include: { provider: true, prescription: { include: { lines: true } } } },
        studies: { orderBy: { studyDate: "desc" } },
        packages: { include: { sessions: { orderBy: { date: "desc" } } }, orderBy: { purchaseDate: "desc" } },
        invoices: { include: { lines: true, payments: true }, orderBy: { date: "desc" } },
        messages: { orderBy: { createdAt: "desc" } },
        referrals: { include: { provider: true }, orderBy: { date: "desc" } },
      },
    }),
    prisma.staff.findFirst({ where: { role: "OWNER_DOCTOR" } }),
    prisma.staff.findMany({ where: { role: "PHYSIO", active: true } }),
  ]);

  if (!patient) notFound();

  const dues = patient.invoices.reduce((s, inv) => {
    const total = inv.lines.reduce((a, l) => a + l.lineTotal, 0);
    const paid = inv.payments.reduce((a, p) => a + p.amount, 0);
    return s + Math.max(0, total - paid);
  }, 0);

  return (
    <div>
      <div className="mb-4">
        <BackLink href="/patients">← All patients</BackLink>
      </div>

      {searchParams.saved && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          Saved successfully.
        </div>
      )}

      {/* Header */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <Avatar text={initials(patient.name)} className="h-14 w-14 text-base" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{patient.name}</h1>
              <p className="text-sm text-slate-500">
                {ageGender(patient.age, patient.gender)} · {patient.phone}
                {patient.address ? ` · ${patient.address}` : ""}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge className="bg-slate-100 text-slate-600">ABHA: {patient.abhaNumber || "not linked"}</Badge>
                <Badge className={patient.consentStatus === "GRANTED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                  Consent: {patient.consentStatus.toLowerCase()}
                </Badge>
                <Badge className={patient.whatsappOptIn ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}>
                  WhatsApp {patient.whatsappOptIn ? "opted-in" : "off"}
                </Badge>
                {dues > 0 && <Badge className="bg-red-100 text-red-700">Dues {inr(dues)}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {doctor && (
              <Link href={`/patients/${patient.id}/visit?providerId=${doctor.id}`} className="btn-primary">
                <Stethoscope size={16} /> New visit
              </Link>
            )}
            <Link href={`/patients/${patient.id}/refer`} className="btn-ghost btn-sm">
              <ArrowUpRight size={15} /> Refer
            </Link>
            <UploadStudyForm patientId={patient.id} compact />
            <form action={sendMessage}>
              <input type="hidden" name="patientId" value={patient.id} />
              <input type="hidden" name="type" value="RECALL" />
              <button className="btn-ghost btn-sm">
                <Bell size={15} /> Recall
              </button>
            </form>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Visits */}
          <Card>
            <CardHeader title="Visit history" subtitle={`${patient.visits.length} visits`} />
            {patient.visits.length === 0 ? (
              <EmptyState>No visits yet.</EmptyState>
            ) : (
              <div className="divide-y divide-slate-100">
                {patient.visits.map((v) => (
                  <div key={v.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{fmtDate(v.date)}</span>
                        <Badge className="bg-slate-100 text-slate-600">
                          {v.encounterType === "FIRST" ? "First visit" : "Follow-up"}
                        </Badge>
                        <span className="text-xs text-slate-400">{v.provider.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/patients/${patient.id}/refer?visitId=${v.id}`} className="btn-ghost btn-sm">
                          <ArrowUpRight size={13} /> Refer
                        </Link>
                        {v.prescription && (
                          <Link href={`/rx/${v.prescription.id}`} className="btn-ghost btn-sm" target="_blank">
                            <Printer size={13} /> Print Rx
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 grid gap-1 text-sm text-slate-600">
                      {v.complaint && <p><span className="text-slate-400">Complaint:</span> {v.complaint}</p>}
                      {v.diagnosis && <p><span className="text-slate-400">Diagnosis:</span> {v.diagnosis}</p>}
                      {v.plan && <p><span className="text-slate-400">Plan:</span> {v.plan}</p>}
                    </div>
                    {v.prescription && v.prescription.lines.length > 0 && (
                      <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 text-slate-500">
                            <tr>
                              <th className="px-3 py-1.5 text-left">Drug</th>
                              <th className="px-3 py-1.5 text-left">Dose</th>
                              <th className="px-3 py-1.5 text-left">Frequency</th>
                              <th className="px-3 py-1.5 text-left">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {v.prescription.lines.map((l) => (
                              <tr key={l.id}>
                                <td className="px-3 py-1.5">
                                  <span className="font-medium text-slate-700">{l.genericName}</span>
                                  {l.brandName ? <span className="text-slate-400"> ({l.brandName})</span> : null}
                                  {l.scheduleFlag !== "NONE" && (
                                    <Badge className="ml-1 bg-amber-100 text-amber-700">{l.scheduleFlag}</Badge>
                                  )}
                                </td>
                                <td className="px-3 py-1.5 text-slate-600">{l.dose || "—"}</td>
                                <td className="px-3 py-1.5 text-slate-600">{l.frequency || "—"}</td>
                                <td className="px-3 py-1.5 text-slate-600">{l.duration || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Imaging */}
          <Card>
            <CardHeader title="X-ray / Imaging" subtitle={`${patient.studies.length} studies`} action={<UploadStudyForm patientId={patient.id} compact />} />
            {patient.studies.length === 0 ? (
              <EmptyState>No imaging on record.</EmptyState>
            ) : (
              <div className="divide-y divide-slate-100">
                {patient.studies.map((s) => (
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
                        <p className="text-sm font-medium text-slate-800">
                          {s.bodyPart} {s.view ? <span className="font-normal text-slate-400">· {s.view}</span> : null}
                        </p>
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
                          <Share2 size={13} /> Share
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Referrals */}
          <Card>
            <CardHeader
              title="Referrals"
              subtitle={`${patient.referrals.length} letter${patient.referrals.length === 1 ? "" : "s"}`}
              action={
                <Link href={`/patients/${patient.id}/refer`} className="text-sm font-medium text-brand-700 hover:underline">
                  + New referral
                </Link>
              }
            />
            {patient.referrals.length === 0 ? (
              <EmptyState>No referral letters yet.</EmptyState>
            ) : (
              <div className="divide-y divide-slate-100">
                {patient.referrals.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">{r.referToName}</p>
                        {r.urgency === "URGENT" && (
                          <Badge className="bg-red-100 text-red-700">{REFERRAL_URGENCY_LABELS[r.urgency]}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {[r.specialty, r.referToFacility].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">{r.reason}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{fmtDate(r.date)} · {r.provider.name}</p>
                    </div>
                    <Link href={`/referral/${r.id}`} target="_blank" className="btn-ghost btn-sm shrink-0">
                      <Printer size={13} /> Print
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Physio */}
          <Card>
            <CardHeader
              title="Physiotherapy"
              action={
                <Link href={`/patients/${patient.id}/physio`} className="text-sm font-medium text-brand-700 hover:underline">
                  Assessments &amp; progress →
                </Link>
              }
            />
            {patient.packages.length === 0 ? (
              <EmptyState>No physio packages.</EmptyState>
            ) : (
              <div className="divide-y divide-slate-100">
                {patient.packages.map((pkg) => {
                  const remaining = pkg.totalSessions - pkg.sessionsUsed;
                  const pct = Math.round((pkg.sessionsUsed / pkg.totalSessions) * 100);
                  const low = remaining <= 2 && pkg.status === "ACTIVE";
                  return (
                    <div key={pkg.id} className="p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">{pkg.name}</p>
                        <Badge className={pkg.status === "ACTIVE" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}>
                          {pkg.status.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>{pkg.sessionsUsed}/{pkg.totalSessions} sessions</span>
                          <span>{inr(pkg.price)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full ${low ? "bg-amber-400" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {low && (
                        <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                          Renewal due — only {remaining} session{remaining === 1 ? "" : "s"} left.
                        </p>
                      )}
                      {pkg.status === "ACTIVE" && remaining > 0 && (
                        <form action={recordPhysioSession} className="mt-3 flex items-end gap-2">
                          <input type="hidden" name="packageId" value={pkg.id} />
                          <div className="w-20">
                            <label className="label">Pain 0-10</label>
                            <input name="painScore" type="number" min={0} max={10} className="input !py-1.5" placeholder="—" />
                          </div>
                          <div className="flex-1">
                            <label className="label">Therapist</label>
                            <select name="therapistId" className="input !py-1.5">
                              {physios.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                          <button className="btn-primary btn-sm">Log session</button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Billing */}
          <Card>
            <CardHeader title="Billing" subtitle={dues > 0 ? `Outstanding ${inr(dues)}` : "No dues"} />
            <div className="divide-y divide-slate-100">
              {patient.invoices.map((inv) => {
                const total = inv.lines.reduce((a, l) => a + l.lineTotal, 0);
                const paid = inv.payments.reduce((a, p) => a + p.amount, 0);
                const balance = total - paid;
                return (
                  <div key={inv.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{fmtDate(inv.date)}</span>
                      <Badge className={STATUS_BADGE[inv.status] || "bg-slate-100 text-slate-600"}>{inv.status.toLowerCase()}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{inv.lines.map((l) => l.description).join(", ")}</p>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{inr(total)}</span>
                      <div className="flex items-center gap-2">
                        {balance > 0 && <span className="text-xs text-red-600">Bal {inr(balance)}</span>}
                        <Link href={`/receipt/${inv.id}`} target="_blank" className="text-xs text-brand-700 hover:underline">
                          Receipt
                        </Link>
                      </div>
                    </div>
                    {balance > 0 && (
                      <form action={addPayment} className="mt-2 flex items-center gap-2">
                        <input type="hidden" name="invoiceId" value={inv.id} />
                        <input name="amount" type="number" min={1} defaultValue={balance} className="input !py-1.5 w-24" />
                        <select name="mode" className="input !py-1.5 w-24">
                          <option value="CASH">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="CARD">Card</option>
                        </select>
                        <button className="btn-ghost btn-sm">Collect</button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-100 p-4">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-brand-700">+ New bill</summary>
                <div className="mt-3">
                  <NewInvoiceForm patientId={patient.id} />
                </div>
              </details>
            </div>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader title="WhatsApp messages" />
            {patient.messages.length === 0 ? (
              <EmptyState>No messages sent.</EmptyState>
            ) : (
              <div className="divide-y divide-slate-100">
                {patient.messages.map((m) => (
                  <div key={m.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">{MESSAGE_TYPE_LABELS[m.type] || m.type}</span>
                      <Badge
                        className={
                          m.status === "READ"
                            ? "bg-blue-100 text-blue-700"
                            : m.status === "DELIVERED" || m.status === "SENT"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {m.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{m.body}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{fmtDateTime(m.sentAt || m.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
