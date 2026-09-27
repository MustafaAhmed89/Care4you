import { notFound } from "next/navigation";
import { Download, Database } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireResource } from "@/lib/session";
import { updateClinic } from "@/app/actions";
import { PageHeader, Card, CardHeader } from "@/components/ui";
import { fmtDate } from "@/lib/format";

// F-26 — CSV exports offered on the Settings page (paired with the full JSON backup).
const CSV_EXPORTS: [string, string][] = [
  ["patients", "Patients"],
  ["appointments", "Appointments"],
  ["visits", "Visits"],
  ["invoices", "Invoices"],
  ["payments", "Payments"],
  ["imaging", "Imaging"],
  ["physio", "Physio"],
];

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireResource("settings");
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Clinic identity, GST, X-ray & modules" />

      <form action={updateClinic} className="space-y-5">
        <Card>
          <CardHeader title="Clinic identity" subtitle="Shown on prescriptions, receipts & the app header" />
          <div className="grid grid-cols-2 gap-4 p-5">
            <div className="col-span-2">
              <label className="label">Clinic name</label>
              <input name="name" defaultValue={clinic.name} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Tagline</label>
              <input name="tagline" defaultValue={clinic.tagline ?? ""} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <input name="address" defaultValue={clinic.address ?? ""} className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" defaultValue={clinic.phone ?? ""} className="input" />
            </div>
            <div>
              <label className="label">Logo initials</label>
              <input name="logoInitials" defaultValue={clinic.logoInitials} maxLength={3} className="input" />
            </div>
            <div>
              <label className="label">Doctor name</label>
              <input name="doctorName" defaultValue={clinic.doctorName ?? ""} className="input" />
            </div>
            <div>
              <label className="label">NMC Reg. No.</label>
              <input name="nmcRegNo" defaultValue={clinic.nmcRegNo ?? ""} className="input" />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Billing & GST" subtitle="Healthcare services stay GST-exempt; pharmacy/OTC lines are taxable when registered" />
          <div className="grid grid-cols-2 gap-4 p-5">
            <label className="col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" name="gstRegistered" defaultChecked={clinic.gstRegistered} className="h-4 w-4" />
              This clinic is GST-registered
            </label>
            <div className="col-span-2">
              <label className="label">GSTIN</label>
              <input name="gstin" defaultValue={clinic.gstin ?? ""} className="input" placeholder="29ABCDE1234F1Z5" />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="X-ray (AERB) & modules" />
          <div className="grid grid-cols-2 gap-4 p-5">
            <div>
              <label className="label">AERB Licence No.</label>
              <input name="aerbLicenceNo" defaultValue={clinic.aerbLicenceNo ?? ""} className="input" />
            </div>
            <div>
              <label className="label">AERB renewal</label>
              <input disabled defaultValue={fmtDate(clinic.aerbRenewal)} className="input bg-slate-50" />
            </div>
            <label className="col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" name="pharmacyEnabled" defaultChecked={clinic.pharmacyEnabled} className="h-4 w-4" />
              Enable Pharmacy module (optional — off by default)
            </label>
            <p className="col-span-2 text-[11px] text-slate-400">
              KPME Reg: {clinic.kpmeRegNo || "—"} · Pharmacy dispensing with Schedule H/H1 registers is a Phase-3 add-on.
            </p>
          </div>
        </Card>

        <div className="flex justify-end">
          <button className="btn-primary">Save settings</button>
        </div>
      </form>

      {/* F-26 — data export / backup */}
      <Card className="mt-5">
        <CardHeader title="Export & backup" subtitle="Your data is always yours — download anytime, no lock-in" />
        <div className="p-5">
          <p className="mb-3 text-sm text-slate-600">
            Download any record type as a spreadsheet (CSV), or a full backup of everything as JSON.
          </p>
          <div className="flex flex-wrap gap-2">
            {CSV_EXPORTS.map(([slug, label]) => (
              <a key={slug} href={`/api/export?entity=${slug}`} className="btn-ghost btn-sm">
                <Download size={14} /> {label}
              </a>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <a href="/api/export?entity=all" className="btn-primary">
              <Database size={16} /> Download full backup (JSON)
            </a>
            <p className="mt-2 text-[11px] text-slate-400">
              Includes all records — patients, visits, billing, imaging, physio, messages, referrals. Restricted to the owner/admin.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
