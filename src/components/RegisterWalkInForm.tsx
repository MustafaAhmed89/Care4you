"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { registerWalkIn } from "@/app/actions";
import { SERVICE_LABELS } from "@/lib/constants";

export default function RegisterWalkInForm({ providers }: { providers: { id: string; name: string; role: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <UserPlus size={16} /> Register walk-in
      </button>

      {open && (
        <div className="no-print fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-20">
          <div className="card w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">Register walk-in patient</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form
              action={async (fd) => {
                await registerWalkIn(fd);
                setOpen(false);
              }}
              className="grid grid-cols-2 gap-3 p-5"
            >
              <div className="col-span-2">
                <label className="label">Patient name</label>
                <input name="name" required className="input" placeholder="e.g. Ravi Kumar" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="phone" required className="input" placeholder="+91 …" />
                <p className="mt-1 text-[11px] text-slate-400">Existing patients are matched by phone.</p>
              </div>
              <div>
                <label className="label">Provider</label>
                <select name="providerId" required className="input">
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Service</label>
                <select name="serviceType" className="input" defaultValue="CONSULT">
                  {Object.entries(SERVICE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Source</label>
                <select name="source" className="input" defaultValue="WALK_IN">
                  <option value="WALK_IN">Walk-in</option>
                  <option value="PHONE">Phone</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Reason / complaint (optional)</label>
                <input name="reason" className="input" placeholder="e.g. Knee pain" />
              </div>
              <div className="col-span-2 mt-1 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add to queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
