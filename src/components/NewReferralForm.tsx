"use client";

import { createReferral } from "@/app/actions";
import { REFERRAL_SPECIALTIES } from "@/lib/constants";

export default function NewReferralForm({
  patientId,
  providerId,
  visitId,
  defaultReason = "",
  defaultSummary = "",
  defaultMedications = "",
}: {
  patientId: string;
  providerId: string;
  visitId?: string;
  defaultReason?: string;
  defaultSummary?: string;
  defaultMedications?: string;
}) {
  return (
    <form action={createReferral} className="card space-y-5 p-5">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="providerId" value={providerId} />
      {visitId && <input type="hidden" name="visitId" value={visitId} />}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Refer to (name)*</label>
          <input name="referToName" required className="input" placeholder="Dr. Anil Kishore" />
        </div>
        <div>
          <label className="label">Hospital / centre</label>
          <input name="referToFacility" className="input" placeholder="Manipal Hospital, Bengaluru" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Specialty / service</label>
          <input name="specialty" className="input" list="referral-specialties" placeholder="Spine Surgery" />
          <datalist id="referral-specialties">
            {REFERRAL_SPECIALTIES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label">Urgency</label>
          <select name="urgency" className="input" defaultValue="ROUTINE">
            <option value="ROUTINE">Routine</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Reason for referral / provisional diagnosis*</label>
        <textarea
          name="reason"
          required
          rows={2}
          className="input"
          defaultValue={defaultReason}
          placeholder="e.g. Chronic low back pain not responding to conservative care — for MRI and surgical opinion."
        />
      </div>

      <div>
        <label className="label">Clinical summary</label>
        <textarea
          name="clinicalSummary"
          rows={4}
          className="input"
          defaultValue={defaultSummary}
          placeholder="Relevant history, examination findings, investigations done so far…"
        />
      </div>

      <div>
        <label className="label">Current medication</label>
        <textarea
          name="medications"
          rows={2}
          className="input"
          defaultValue={defaultMedications}
          placeholder="Relevant current medication (optional)."
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">Generate referral letter</button>
      </div>
    </form>
  );
}
