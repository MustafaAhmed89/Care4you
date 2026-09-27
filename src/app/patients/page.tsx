import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireResource } from "@/lib/session";
import { PageHeader, Card, Avatar, EmptyState } from "@/components/ui";
import { fmtDate, initials, ageGender } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PatientsPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireResource("patients");
  const q = (searchParams.q || "").trim().toLowerCase();

  const all = await prisma.patient.findMany({
    where: { softDeleted: false },
    include: { visits: { orderBy: { date: "desc" }, take: 1 }, _count: { select: { visits: true } } },
    orderBy: { createdAt: "desc" },
  });

  const patients = q
    ? all.filter((p) => p.name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q))
    : all;

  return (
    <div>
      <PageHeader title="Patients" subtitle={`${all.length} patients · search by name or phone`} />

      <Card className="mb-4">
        <form className="flex items-center gap-2 p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={searchParams.q || ""}
              placeholder="Search patients…"
              className="input pl-9"
              autoFocus
            />
          </div>
          <button className="btn-primary">Search</button>
          {q && (
            <Link href="/patients" className="btn-ghost">
              Clear
            </Link>
          )}
        </form>
      </Card>

      <Card>
        {patients.length === 0 ? (
          <EmptyState>No patients match “{searchParams.q}”.</EmptyState>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>
                <th className="th">Patient</th>
                <th className="th">Phone</th>
                <th className="th hidden md:table-cell">Visits</th>
                <th className="th hidden md:table-cell">Last visit</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="td">
                    <Link href={`/patients/${p.id}`} className="flex items-center gap-3">
                      <Avatar text={initials(p.name)} />
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-500">{ageGender(p.age, p.gender)}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="td">{p.phone}</td>
                  <td className="td hidden md:table-cell">{p._count.visits}</td>
                  <td className="td hidden md:table-cell">{p.visits[0] ? fmtDate(p.visits[0].date) : "—"}</td>
                  <td className="td text-right">
                    <Link href={`/patients/${p.id}`} className="text-sm font-medium text-brand-700 hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
