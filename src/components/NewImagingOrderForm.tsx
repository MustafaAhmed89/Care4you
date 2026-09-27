"use client";

import { createImagingOrder } from "@/app/actions";
import { XRAY_REGIONS, XRAY_VIEWS, XRAY_SIDES } from "@/lib/constants";

// F-09 — doctor places an imaging order that lands in the technician worklist.
export default function NewImagingOrderForm({
  patients,
  doctors,
}: {
  patients: { id: string; name: string; phone: string }[];
  doctors: { id: string; name: string }[];
}) {
  return (
    <form action={createImagingOrder} className="grid grid-cols-2 gap-3 p-5">
      <div className="col-span-2">
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
        <label className="label">Region</label>
        <input name="region" required className="input" list="xray-regions" placeholder="Right Knee" />
        <datalist id="xray-regions">
          {XRAY_REGIONS.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="label">View</label>
        <input name="view" className="input" list="xray-views" placeholder="AP + Lateral" />
        <datalist id="xray-views">
          {XRAY_VIEWS.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="label">Side</label>
        <select name="side" className="input" defaultValue="NA">
          {XRAY_SIDES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Referring doctor</label>
        <select name="orderedById" className="input">
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label className="label">Clinical note (optional)</label>
        <input name="note" className="input" placeholder="Indication, e.g. trauma — rule out fracture" />
      </div>
      <div className="col-span-2 flex justify-end">
        <button className="btn-primary">Place order</button>
      </div>
    </form>
  );
}
