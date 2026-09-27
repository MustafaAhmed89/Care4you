import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// F-23 — sign-in page. Rendered "bare" (no staff shell) by the root layout.
export default async function LoginPage() {
  const clinic = await prisma.clinic.findFirst();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Suspense fallback={null}>
        <LoginForm
          clinicName={clinic?.name ?? "OrthoCare"}
          logoInitials={clinic?.logoInitials ?? "OC"}
          tagline={clinic?.tagline ?? ""}
        />
      </Suspense>
    </div>
  );
}
