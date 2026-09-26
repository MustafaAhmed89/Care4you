"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadStudy } from "@/app/actions";

export default function UploadStudyForm({ patientId, compact }: { patientId: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button className={compact ? "btn-ghost btn-sm" : "btn-primary"} onClick={() => setOpen(true)}>
        <Upload size={15} /> Add X-ray
      </button>
    );
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Attach X-ray image</h3>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <form
        action={async (fd) => {
          await uploadStudy(fd);
          setOpen(false);
        }}
        className="grid grid-cols-2 gap-3"
      >
        <input type="hidden" name="patientId" value={patientId} />
        <div>
          <label className="label">Body part</label>
          <input name="bodyPart" required className="input" placeholder="e.g. Right Knee" />
        </div>
        <div>
          <label className="label">View</label>
          <input name="view" className="input" placeholder="AP + Lateral" />
        </div>
        <div>
          <label className="label">Side</label>
          <select name="side" className="input" defaultValue="NA">
            <option value="NA">N/A</option>
            <option value="LEFT">Left</option>
            <option value="RIGHT">Right</option>
          </select>
        </div>
        <div>
          <label className="label">Image (phone photo / JPEG / PDF)</label>
          <input name="file" type="file" accept="image/*,application/pdf" className="input !py-1.5" />
        </div>
        <div className="col-span-2">
          <label className="label">Report / impression (optional)</label>
          <textarea name="reportText" rows={2} className="input" placeholder="e.g. No fracture; soft-tissue swelling." />
        </div>
        <div className="col-span-2 flex justify-end">
          <button type="submit" className="btn-primary">
            Save X-ray
          </button>
        </div>
      </form>
      <p className="mt-2 text-[11px] text-slate-400">
        No PACS needed — snap the film with a phone or upload a JPEG/PDF exported from the X-ray console.
      </p>
    </div>
  );
}
