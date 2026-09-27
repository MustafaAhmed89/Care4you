"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { captureImagingStudy } from "@/app/actions";

// F-09/F-12 — technician captures an ordered study: phone photo + exposure details.
export default function CaptureStudyForm({
  orderId,
  operators,
}: {
  orderId: string;
  operators: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary btn-sm">
        <Camera size={14} /> Capture
      </button>
    );
  }

  return (
    <form action={captureImagingStudy} className="mt-3 w-full space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label className="label">X-ray image (phone photo or file)</label>
        <input
          type="file"
          name="file"
          accept="image/*"
          capture="environment"
          className="block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div>
          <label className="label">Machine</label>
          <input name="machineModel" className="input !py-1.5" placeholder="Siemens Multix" />
        </div>
        <div>
          <label className="label">kVp</label>
          <input name="kvp" type="number" min={0} className="input !py-1.5" placeholder="60" />
        </div>
        <div>
          <label className="label">mAs</label>
          <input name="mas" type="number" min={0} className="input !py-1.5" placeholder="8" />
        </div>
        <div>
          <label className="label">Operator</label>
          <select name="operatorId" className="input !py-1.5">
            <option value="">—</option>
            {operators.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Report / impression (optional)</label>
        <input name="reportText" className="input !py-1.5" placeholder="e.g. No fracture; mild degenerative changes" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">
          Cancel
        </button>
        <button className="btn-primary btn-sm">Save study</button>
      </div>
    </form>
  );
}
