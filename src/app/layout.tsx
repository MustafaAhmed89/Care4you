import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getCurrentRole } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "OrthoCare — Clinic OS",
  description: "Simple clinic management for small ortho & physio clinics",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Patient-facing pages (F-03 reschedule/cancel link) render bare — no staff shell.
  const pathname = headers().get("x-pathname") || "";
  if (pathname.startsWith("/appt")) {
    return (
      <html lang="en">
        <body>
          <main className="min-h-screen bg-slate-50">{children}</main>
        </body>
      </html>
    );
  }

  const clinic = await prisma.clinic.findFirst();
  const role = getCurrentRole();

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar
            role={role}
            clinicName={clinic?.name ?? "OrthoCare"}
            tagline={clinic?.tagline ?? ""}
            logoInitials={clinic?.logoInitials ?? "OC"}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar
              role={role}
              clinicPhone={clinic?.phone ?? ""}
              clinicName={clinic?.name ?? "OrthoCare"}
              logoInitials={clinic?.logoInitials ?? "OC"}
            />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
