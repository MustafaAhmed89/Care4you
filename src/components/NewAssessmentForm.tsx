"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createAssessment } from "@/app/actions";

type Rom = { joint: string; degrees: string };

const SCALES: Record<string, { label: string; max: number; hint: string }> = {
  NONE: { label: "None", max: 0, hint: "" },
  LEFS: { label: "LEFS (Lower Extremity Functional Scale)", max: 80, hint: "0–80 · higher = better function" },
  PSFS: { label: "PSFS (Patient-Specific Functional Scale)", max: 10, hint: "0–10 · higher = better" },
  ODI: { label: "Oswestry Disability Index", max: 100, hint: "0–100% · lower = better" },
};

export default function NewAssessmentForm({
  patientId,
  therapists,
  packages,
}: {
  patientId: string;
  therapists: { id: string; name: string }[];
  packages: { id: string; name: string }[];
}) {
  const [pain, setPain] = useState("5");
  const [scaleType, setScaleType] = useState("LEFS");
  const [scaleScore, setScaleScore] = useState("");
  const [rom, setRom] = useState<Rom[]>([{ joint: "", degrees: "" }]);

  const scaleMax = useMemo(() => SCALES[scaleType]?.max ?? 0, [scaleType]);

  const updateRom = (i: number, key: keyof Rom, val: string) =>
    setRom((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  return (
    <form action={createAssessment} className="space-y-4">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="rom" value={JSON.stringify(rom)} />
      <input type="hidden" name="scaleMax" value={scaleMax || ""} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <label className="label">Pain (0–10)</label>
          <input name="painScore" type="number" min={0} max={10} className="input" value={pain} onChange={(e) => setPain(e.target.value)} />
        </div>
        <div>
          <label className="label">Therapist</label>
          <select name="therapistId" className="input">
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        {packages.length > 0 && (
          <div>
            <label className="label">Package (optional)</label>
            <select name="packageId" className="input">
              <option value="">—</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="col-span-2">
          <label className="label">Functional scale</label>
          <select name="scaleType" className="input" value={scaleType} onChange={(e) => setScaleType(e.target.value)}>
            {Object.entries(SCALES).map(([v, s]) => (
              <option key={v} value={v}>{s.label}</option>
            ))}
          </select>
          {SCALES[scaleType]?.hint && <p className="mt-1 text-[11px] text-slate-400">{SCALES[scaleType].hint}</p>}
        </div>
        {scaleType !== "NONE" && (
          <div>
            <label className="label">Score {scaleMax ? `(0–${scaleMax})` : ""}</label>
            <input name="scaleScore" type="number" min={0} max={scaleMax || undefined} className="input" value={scaleScore} onChange={(e) => setScaleScore(e.target.value)} />
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Range of motion (goniometer)</label>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setRom((rs) => [...rs, { joint: "", degrees: "" }])}>
            <Plus size={13} /> Add joint
          </button>
        </div>
        <div className="space-y-2">
          {rom.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input className="input flex-1" placeholder="Joint / movement (e.g. Right Knee Flexion)" value={r.joint} onChange={(e) => updateRom(i, "joint", e.target.value)} />
              <div className="flex w-32 items-center gap-1">
                <input className="input" type="number" placeholder="°" value={r.degrees} onChange={(e) => updateRom(i, "degrees", e.target.value)} />
                <span className="text-xs text-slate-400">°</span>
              </div>
              {rom.length > 1 && (
                <button type="button" onClick={() => setRom((rs) => rs.filter((_, idx) => idx !== i))} className="flex items-center px-1 text-slate-400 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea name="note" rows={2} className="input" placeholder="Subjective/objective notes, treatment given…" />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">Save assessment</button>
      </div>
    </form>
  );
}
