"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createInvoice } from "@/app/actions";
import { inr } from "@/lib/format";

type Line = { itemType: string; description: string; qty: number; unitPrice: number };

const PRESETS: { label: string; line: Line }[] = [
  { label: "Consultation ₹500", line: { itemType: "CONSULT", description: "Consultation", qty: 1, unitPrice: 500 } },
  { label: "X-ray ₹400", line: { itemType: "XRAY", description: "X-ray", qty: 1, unitPrice: 400 } },
  { label: "Physio ₹350", line: { itemType: "PHYSIO", description: "Physiotherapy session", qty: 1, unitPrice: 350 } },
  { label: "Dressing ₹200", line: { itemType: "PROCEDURE", description: "Dressing / procedure", qty: 1, unitPrice: 200 } },
];

export default function NewInvoiceForm({ patientId, visitId }: { patientId: string; visitId?: string }) {
  const [lines, setLines] = useState<Line[]>([{ itemType: "CONSULT", description: "Consultation", qty: 1, unitPrice: 500 }]);
  const [payMode, setPayMode] = useState("CASH");
  const [payAmount, setPayAmount] = useState<number | "">("");

  const total = useMemo(() => lines.reduce((s, l) => s + l.qty * l.unitPrice, 0), [lines]);
  const update = (i: number, key: keyof Line, val: string | number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)));

  return (
    <form action={createInvoice} className="space-y-4">
      <input type="hidden" name="patientId" value={patientId} />
      {visitId && <input type="hidden" name="visitId" value={visitId} />}
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <input type="hidden" name="payMode" value={payMode} />
      <input type="hidden" name="payAmount" value={payAmount === "" ? 0 : payAmount} />

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => setLines((ls) => [...ls, { ...p.line }])}
          >
            <Plus size={13} /> {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input className="input col-span-5" value={l.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description" />
            <select className="input col-span-3" value={l.itemType} onChange={(e) => update(i, "itemType", e.target.value)}>
              <option value="CONSULT">Consult</option>
              <option value="XRAY">X-ray</option>
              <option value="PHYSIO">Physio</option>
              <option value="PROCEDURE">Procedure</option>
              <option value="PHARMACY">Pharmacy</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="number" min={1} className="input col-span-1" value={l.qty} onChange={(e) => update(i, "qty", parseInt(e.target.value) || 1)} />
            <input type="number" min={0} className="input col-span-2" value={l.unitPrice} onChange={(e) => update(i, "unitPrice", parseInt(e.target.value) || 0)} />
            <button type="button" className="col-span-1 flex items-center justify-center text-slate-400 hover:text-red-500" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm text-slate-500">Total</span>
        <span className="text-lg font-semibold text-slate-900">{inr(total)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="col-span-2">
          <label className="label">Amount received</label>
          <div className="flex gap-2">
            <input type="number" min={0} className="input" value={payAmount} onChange={(e) => setPayAmount(e.target.value === "" ? "" : parseInt(e.target.value) || 0)} placeholder="0" />
            <button type="button" className="btn-ghost btn-sm whitespace-nowrap" onClick={() => setPayAmount(total)}>
              Pay full
            </button>
          </div>
        </div>
        <div className="col-span-2">
          <label className="label">Payment mode</label>
          <div className="flex gap-1.5">
            {["CASH", "UPI", "CARD"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPayMode(m)}
                className={`btn-sm flex-1 rounded-lg border ${
                  payMode === m ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Create bill &amp; receipt
        </button>
      </div>
    </form>
  );
}
