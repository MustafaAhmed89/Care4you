import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "OrthoCare — Clinic OS",
  description: "Simple clinic management for small ortho & physio clinics",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get("x-pathname") || "";

  // Patient-facing (/appt/*) and the sign-in page render bare — no staff shell.
  if (pathname.startsWith("/appt") || pathname.startsWith("/login")) {
    return (
      <html lang="en">
        <body>
          <main className="min-h-screen bg-slate-50">{children}</main>
        </body>
      </html>
    );
  }

  // Everything else is staff-only. Middleware already gates by session-cookie
  // presence; this is the authoritative server-side check (also catches an
  // expired/invalid cookie that slipped past the edge check).
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clinic = await prisma.clinic.findFirst();

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar
            role={user.role}
            clinicName={clinic?.name ?? "OrthoCare"}
            tagline={clinic?.tagline ?? ""}
            logoInitials={clinic?.logoInitials ?? "OC"}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar
              role={user.role}
              userName={user.name}
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
