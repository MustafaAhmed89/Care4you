"use client";

import { useState } from "react";
import { Check, CalendarClock, ArrowLeft } from "lucide-react";
import { respondToAppointment } from "@/app/actions";

// Patient-facing (login-free) confirm / reschedule / cancel controls for /appt/[id].
export default function AppointmentActions({ id }: { id: string }) {
  const [mode, setMode] = useState<null | "reschedule" | "cancel">(null);

  if (mode === "reschedule") {
    return (
      <form action={respondToAppointment} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="action" value="RESCHEDULE" />
        <div>
          <label className="label">When would suit you better?</label>
          <input
            name="note"
            className="input"
            placeholder="e.g. Any morning next week, or Friday after 5 pm"
            autoFocus
          />
          <p className="mt-1 text-xs text-slate-500">The clinic will call you to confirm a new time.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode(null)} className="btn-ghost">
            <ArrowLeft size={16} /> Back
          </button>
          <button className="btn-primary flex-1">
            <CalendarClock size={16} /> Send reschedule request
          </button>
        </div>
      </form>
    );
  }

  if (mode === "cancel") {
    return (
      <form action={respondToAppointment} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="action" value="CANCEL" />
        <div>
          <label className="label">Reason (optional)</label>
          <input name="note" className="input" placeholder="Let the clinic know why (optional)" autoFocus />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode(null)} className="btn-ghost">
            <ArrowLeft size={16} /> Back
          </button>
          <button className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
            Confirm cancellation
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-2.5">
      <form action={respondToAppointment}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="action" value="CONFIRM" />
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700">
          <Check size={18} /> Yes, I&apos;ll be there
        </button>
      </form>
      <button
        onClick={() => setMode("reschedule")}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
      >
        <CalendarClock size={17} /> Reschedule
      </button>
      <button
        onClick={() => setMode("cancel")}
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
      >
        Cancel appointment
      </button>
    </div>
  );
}
