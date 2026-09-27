import { notFound } from "next/navigation";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireResource } from "@/lib/session";
import NewAssessmentForm from "@/components/NewAssessmentForm";
import { Card, CardHeader, Badge, Avatar, EmptyState, BackLink } from "@/components/ui";
import { fmtDate, initials, ageGender } from "@/lib/format";

export const dynamic = "force-dynamic";

type Pt = { label: string; value: number };

function Trend({ title, subtitle, points, min, max, color }: { title: string; subtitle?: string; points: Pt[]; min: number; max: number; color: string }) {
  const W = 320, H = 132, padL = 26, padR = 10, padT = 10, padB = 24;
  const iw = W - padL - padR, ih = H - padT - padB;
  const n = points.length;
  const x = (i: number) => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const span = max - min || 1;
  const y = (v: number) => padT + ih - ((v - min) / span) * ih;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  return (
    <div className="card p-4">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
        <text x={2} y={padT + 6} fontSize="9" fill="#94a3b8">{max}</text>
        <text x={2} y={padT + ih} fontSize="9" fill="#94a3b8">{min}</text>
        <line x1={padL} y1={padT} x2={padL} y2={padT + ih} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={padL} y1={padT + ih} x2={W - padR} y2={padT + ih} stroke="#e2e8f0" strokeWidth="1" />
        {n > 1 && <path d={path} fill="none" stroke={color} strokeWidth="2" />}
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r="3.2" fill={color} />
        ))}
        {n > 0 && <text x={x(0)} y={H - 8} fontSize="8" fill="#94a3b8" textAnchor="middle">{points[0].label}</text>}
        {n > 1 && <text x={x(n - 1)} y={H - 8} fontSize="8" fill="#94a3b8" textAnchor="middle">{points[n - 1].label}</text>}
      </svg>
      {n > 1 && (
        <p className="mt-1 text-xs text-slate-500">
          {points[0].value} <span className="text-slate-300">→</span>{" "}
          <span className="font-semibold text-slate-800">{points[n - 1].value}</span>
        </p>
      )}
    </div>
  );
}

export default async function PatientPhysioPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string };
}) {
  await requireResource("physio");
  const [patient, therapists] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        assessments: { include: { rom: true, therapist: true }, orderBy: { date: "asc" } },
        packages: { orderBy: { purchaseDate: "desc" } },
        heps: { include: { exercises: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.staff.findMany({ where: { role: "PHYSIO", active: true } }),
  ]);
  if (!patient) notFound();

  const assessments = patient.assessments;
  const painPoints: Pt[] = assessments.filter((a) => a.painScore != null).map((a) => ({ label: fmtDate(a.date), value: a.painScore! }));
  const funcAssess = assessments.filter((a) => a.scaleScore != null && a.scaleType !== "NONE");
  const funcPoints: Pt[] = funcAssess.map((a) => ({ label: fmtDate(a.date), value: a.scaleScore! }));
  const funcMax = Math.max(1, ...funcAssess.map((a) => a.scaleMax ?? 100));
  const funcScale = funcAssess[funcAssess.length - 1]?.scaleType;
  const activePackages = patient.packages.filter((p) => p.status === "ACTIVE");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <BackLink href={`/patients/${patient.id}`}>← Back to patient</BackLink>
      </div>

      {searchParams.saved && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">Assessment saved.</div>
      )}

      <div className="mb-5 flex items-center gap-3">
        <Avatar text={initials(patient.name)} className="h-12 w-12" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{patient.name}</h1>
          <p className="text-sm text-slate-500">
            {ageGender(patient.age, patient.gender)} · Physiotherapy assessments & progress
          </p>
        </div>
      </div>

      {activePackages.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {activePackages.map((p) => (
            <Badge key={p.id} className="bg-brand-100 text-brand-700">
              {p.name}: {p.sessionsUsed}/{p.totalSessions} sessions
            </Badge>
          ))}
        </div>
      )}

      {/* Progress charts */}
      {assessments.length === 0 ? (
        <Card className="mb-5">
          <EmptyState>No assessments yet — record the first one below to start tracking progress.</EmptyState>
        </Card>
      ) : (
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <Trend title="Pain (0–10)" subtitle="lower is better" points={painPoints} min={0} max={10} color="#e11d48" />
          {funcPoints.length > 0 ? (
            <Trend title={`Function — ${funcScale}`} subtitle={`0–${funcMax}`} points={funcPoints} min={0} max={funcMax} color="#0f8785" />
          ) : (
            <div className="card flex items-center justify-center p-4 text-sm text-slate-400">No functional-scale scores yet</div>
          )}
        </div>
      )}

      {/* History */}
      {assessments.length > 0 && (
        <Card className="mb-5">
          <CardHeader title="Assessment history" subtitle={`${assessments.length} on record`} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Pain</th>
                  <th className="th">Function</th>
                  <th className="th">ROM</th>
                  <th className="th">Therapist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...assessments].reverse().map((a) => (
                  <tr key={a.id}>
                    <td className="td whitespace-nowrap">{fmtDate(a.date)}</td>
                    <td className="td">{a.painScore != null ? `${a.painScore}/10` : "—"}</td>
                    <td className="td">{a.scaleScore != null && a.scaleType !== "NONE" ? `${a.scaleScore}/${a.scaleMax ?? "?"} ${a.scaleType}` : "—"}</td>
                    <td className="td text-slate-600">{a.rom.length ? a.rom.map((r) => `${r.joint} ${r.degrees}°`).join(", ") : "—"}</td>
                    <td className="td text-slate-500">{a.therapist?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Home exercise program (F-17) */}
      <Card className="mb-5">
        <CardHeader
          title="Home exercise program"
          subtitle="Prescribe exercises for the patient to do at home"
          action={
            <Link href={`/patients/${patient.id}/hep`} className="btn-primary btn-sm">
              <Dumbbell size={14} /> Build HEP
            </Link>
          }
        />
        {patient.heps.length === 0 ? (
          <EmptyState>No home programs yet — build one to print or WhatsApp to the patient.</EmptyState>
        ) : (
          <div className="divide-y divide-slate-100">
            {patient.heps.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <Link href={`/hep/${h.id}`} target="_blank" className="text-sm font-medium text-slate-800 hover:text-brand-700">
                    {h.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {fmtDate(h.createdAt)} · {h.exercises.length} exercise{h.exercises.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {h.sharedAt && <Badge className="bg-green-100 text-green-700">shared</Badge>}
                  <Link href={`/hep/${h.id}`} target="_blank" className="btn-ghost btn-sm">
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* New assessment */}
      <Card>
        <CardHeader title="New assessment" subtitle="Pain, functional scale & range of motion" />
        <div className="p-5">
          <NewAssessmentForm
            patientId={patient.id}
            therapists={therapists.map((t) => ({ id: t.id, name: t.name }))}
            packages={activePackages.map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
      </Card>
    </div>
  );
}
