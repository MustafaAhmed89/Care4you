"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createVisit } from "@/app/actions";
import { SCHEDULE_FLAG_LABELS } from "@/lib/constants";

type Line = { genericName: string; brandName: string; dose: string; frequency: string; duration: string; scheduleFlag: string };
const emptyLine: Line = { genericName: "", brandName: "", dose: "", frequency: "", duration: "", scheduleFlag: "NONE" };

export default function NewVisitForm({
  patientId,
  providerId,
  appointmentId,
  providerName,
}: {
  patientId: string;
  providerId: string;
  appointmentId?: string;
  providerName?: string;
}) {
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine }]);

  const update = (i: number, key: keyof Line, val: string) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)));

  return (
    <form action={createVisit} className="space-y-5">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="providerId" value={providerId} />
      {appointmentId && <input type="hidden" name="appointmentId" value={appointmentId} />}
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">
          Consultation note {providerName ? <span className="font-normal text-slate-500">· {providerName}</span> : null}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <label className="label">Encounter</label>
            <select name="encounterType" className="input" defaultValue="FIRST">
              <option value="FIRST">First visit</option>
              <option value="FOLLOW_UP">Follow-up</option>
            </select>
          </div>
          <div>
            <label className="label">Injury site</label>
            <input name="injurySite" className="input" placeholder="e.g. Right knee" />
          </div>
          <div>
            <label className="label">Side</label>
            <select name="injurySide" className="input" defaultValue="NA">
              <option value="NA">N/A</option>
              <option value="LEFT">Left</option>
              <option value="RIGHT">Right</option>
            </select>
          </div>
          <div>
            <label className="label">Follow-up (weeks)</label>
            <input name="followUpWeeks" type="number" min={0} className="input" placeholder="4" />
          </div>
          <div className="col-span-2 md:col-span-4">
            <label className="label">Chief complaint</label>
            <input name="complaint" className="input" placeholder="e.g. Knee pain, worse on stairs" />
          </div>
          <div className="col-span-2 md:col-span-2">
            <label className="label">Diagnosis</label>
            <input name="diagnosis" className="input" placeholder="e.g. Osteoarthritis, right knee" />
          </div>
          <div className="col-span-2 md:col-span-2">
            <label className="label">Plan</label>
            <input name="plan" className="input" placeholder="e.g. Physio, NSAIDs, review in 4 weeks" />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Prescription</h2>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setLines((ls) => [...ls, { ...emptyLine }])}>
            <Plus size={14} /> Add drug
          </button>
        </div>
        <div className="space-y-2">
          <div className="hidden grid-cols-12 gap-2 px-1 text-[11px] font-medium uppercase text-slate-400 md:grid">
            <div className="col-span-3">Generic name</div>
            <div className="col-span-2">Brand</div>
            <div className="col-span-2">Dose</div>
            <div className="col-span-2">Frequency</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-1"></div>
          </div>
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 md:grid-cols-12">
              <input className="input md:col-span-3" placeholder="Generic (e.g. Aceclofenac)" value={l.genericName} onChange={(e) => update(i, "genericName", e.target.value)} />
              <input className="input md:col-span-2" placeholder="Brand" value={l.brandName} onChange={(e) => update(i, "brandName", e.target.value)} />
              <input className="input md:col-span-2" placeholder="100 mg" value={l.dose} onChange={(e) => update(i, "dose", e.target.value)} />
              <input className="input md:col-span-2" placeholder="1-0-1" value={l.frequency} onChange={(e) => update(i, "frequency", e.target.value)} />
              <input className="input md:col-span-2" placeholder="5 days" value={l.duration} onChange={(e) => update(i, "duration", e.target.value)} />
              <div className="flex items-center gap-1 md:col-span-1">
                <select className="input !px-1 text-xs" value={l.scheduleFlag} onChange={(e) => update(i, "scheduleFlag", e.target.value)} title="Schedule">
                  <option value="NONE">—</option>
                  <option value="H">H</option>
                  <option value="H1">H1</option>
                </select>
                {lines.length > 1 && (
                  <button type="button" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="label">Advice</label>
          <input name="advice" className="input" placeholder="e.g. Apply ice after activity; avoid stairs" />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Prescriptions default to generic names and print with the doctor&apos;s NMC registration number (NMC 2023 norms).
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <button type="submit" className="btn-primary">
          Save visit &amp; prescription
        </button>
      </div>
    </form>
  );
}
