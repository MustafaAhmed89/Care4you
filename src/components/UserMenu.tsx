"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";

// F-23 — replaces the demo "Viewing as" role switcher: shows the signed-in staff
// member + a log-out button. (Owner-only "View as" impersonation arrives in PR-C.)
export default function UserMenu({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight sm:block">
        <p className="text-sm font-medium text-slate-700">{name}</p>
        <p className="text-[11px] text-slate-400">{ROLE_LABELS[role] ?? role}</p>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </div>
  );
}
