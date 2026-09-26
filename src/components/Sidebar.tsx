"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  ScanLine,
  Receipt,
  MessageCircle,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ROLE_NAV, type NavKey } from "@/lib/constants";

const NAV: { key: NavKey; label: string; href: string; icon: LucideIcon }[] = [
  { key: "queue", label: "Queue · Today", href: "/", icon: LayoutDashboard },
  { key: "patients", label: "Patients", href: "/patients", icon: Users },
  { key: "physio", label: "Physiotherapy", href: "/physio", icon: Activity },
  { key: "imaging", label: "X-ray · Imaging", href: "/imaging", icon: ScanLine },
  { key: "billing", label: "Billing", href: "/billing", icon: Receipt },
  { key: "messages", label: "WhatsApp", href: "/messages", icon: MessageCircle },
  { key: "reports", label: "Reports", href: "/reports", icon: BarChart3 },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({
  role,
  clinicName,
  tagline,
  logoInitials,
}: {
  role: string;
  clinicName: string;
  tagline: string;
  logoInitials: string;
}) {
  const pathname = usePathname();
  const allowed = new Set(ROLE_NAV[role] ?? ROLE_NAV.OWNER_DOCTOR);
  const items = NAV.filter((n) => allowed.has(n.key));

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-brand-900 text-brand-50 md:flex">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">
          {logoInitials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{clinicName}</p>
          <p className="truncate text-[11px] text-brand-200">{tagline}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((n) => {
          const Icon = n.icon;
          const active = isActive(n.href);
          return (
            <Link
              key={n.key}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-white/15 font-medium text-white" : "text-brand-100 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4.5 w-4.5" size={18} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-3 text-[11px] text-brand-300">
        Demo build · v0.1
      </div>
    </aside>
  );
}
