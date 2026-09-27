"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/nav";
import { ROLE_NAV } from "@/lib/constants";

// Mobile-only navigation: a hamburger button that opens a slide-in drawer.
// The desktop Sidebar is hidden below the `md` breakpoint, so this provides
// navigation on phones/small tablets.
//
// The drawer is rendered via a PORTAL to document.body. This is deliberate:
// the app header uses `backdrop-blur` (backdrop-filter), which makes it a
// containing block for position:fixed descendants — so a drawer rendered inside
// the header would be clipped to the header strip. Portaling to <body> makes
// `fixed inset-0` cover the whole viewport correctly.
export default function MobileNav({
  role,
  clinicName,
  logoInitials,
}: {
  role: string;
  clinicName: string;
  logoInitials: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const allowed = new Set(ROLE_NAV[role] ?? ROLE_NAV.OWNER_DOCTOR);
  const items = NAV.filter((n) => allowed.has(n.key));
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const overlay = (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
      <aside className="absolute left-0 top-0 flex h-full w-64 max-w-[80%] flex-col bg-brand-900 text-brand-50 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">
              {logoInitials}
            </span>
            <p className="truncate text-sm font-semibold">{clinicName}</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-brand-100">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.href);
            return (
              <Link
                key={n.key}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? "bg-white/15 font-medium text-white" : "text-brand-100 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
      >
        <Menu size={18} />
      </button>
      {open && mounted && createPortal(overlay, document.body)}
    </div>
  );
}
