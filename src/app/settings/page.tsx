import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateClinic } from "@/app/actions";
import { PageHeader, Card, CardHeader } from "@/components/ui";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
    </div>
  );
}
