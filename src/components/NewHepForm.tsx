"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createHep } from "@/app/actions";
import { EXERCISE_LIBRARY } from "@/lib/constants";

type Row = { name: string; instructions: string; sets: string; reps: string; frequency: string };
const blank: Row = { name: "", instructions: "", sets: "", reps: "", frequency: "" };

// F-17 — build a Home Exercise Program from the library (or custom rows).
export default function NewHepForm({
  patientId,
  therapists,
}: {
  patientId: string;
  therapists: { id: string; name: string }[];
}) {
  const [rows, setRows] = useState<Row[]>([{ ...blank }]);

  const update = (i: number, key: keyof Row, val: string) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  // Picking a library exercise by name auto-fills the rest of that row.
  const onName = (i: number, val: string) => {
    const lib = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === val.trim().toLowerCase());
    setRows((rs) =>
      rs.map((r, idx) =>
        idx === i
          ? lib
            ? { name: lib.name, instructions: lib.instructions, sets: lib.sets, reps: lib.reps, frequency: lib.frequency }
            : { ...r, name: val }
          : r
      )
    );
  };

  const validCount = rows.filter((r) => r.name.trim()).length;

  return (
    <form action={createHep} className="space-y-4">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="exercises" value={JSON.stringify(rows)} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Program title</label>
          <input name="title" className="input" defaultValue="Home exercise program" />
        </div>
        <div>
          <label className="label">Built by (therapist)</label>
          <select name="therapistId" className="input">
            <option value="">—</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Exercises</label>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setRows((rs) => [...rs, { ...blank }])}>
            <Plus size={13} /> Add exercise
          </button>
        </div>
        <datalist id="exercise-lib">
          {EXERCISE_LIBRARY.map((e) => (
            <option key={e.name} value={e.name} />
          ))}
        </datalist>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  list="exercise-lib"
                  placeholder="Exercise name — pick from the library or type your own"
                  value={r.name}
                  onChange={(e) => onName(i, e.target.value)}
                />
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                    className="flex items-center px-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <textarea
                className="input mt-2"
                rows={2}
                placeholder="Instructions"
                value={r.instructions}
                onChange={(e) => update(i, "instructions", e.target.value)}
              />
              <div className="mt-2 grid grid-cols-3 gap-2">
                <input className="input !py-1.5" placeholder="Sets" value={r.sets} onChange={(e) => update(i, "sets", e.target.value)} />
                <input className="input !py-1.5" placeholder="Reps" value={r.reps} onChange={(e) => update(i, "reps", e.target.value)} />
                <input className="input !py-1.5" placeholder="Frequency" value={r.frequency} onChange={(e) => update(i, "frequency", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Note to patient (optional)</label>
        <textarea name="note" rows={2} className="input" placeholder="e.g. Do these daily. Stop and call us if you get sharp pain." />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {validCount} exercise{validCount === 1 ? "" : "s"}
        </p>
        <button type="submit" className="btn-primary" disabled={validCount === 0}>
          Generate HEP
        </button>
      </div>
    </form>
  );
}
