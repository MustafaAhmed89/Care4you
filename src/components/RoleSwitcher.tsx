"use client";

import { useRef } from "react";
import { UserCog } from "lucide-react";
import { setRole } from "@/app/actions";
import { ROLE_LABELS } from "@/lib/constants";

export default function RoleSwitcher({ role }: { role: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={setRole} className="flex items-center gap-2">
      <UserCog className="h-4 w-4 text-slate-400" />
      <span className="hidden text-xs text-slate-500 sm:inline">Viewing as</span>
      <select
        name="role"
        defaultValue={role}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
