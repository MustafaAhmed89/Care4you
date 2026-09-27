import { NextRequest, NextResponse } from "next/server";
import { getCurrentRole } from "@/lib/session";
import { CSV_ENTITIES, getFullBackup } from "@/lib/export";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

// F-26 — one-click data export / backup. Restricted to owner/admin (demo RBAC).
export async function GET(req: NextRequest) {
  const role = getCurrentRole();
  if (role !== "OWNER_DOCTOR" && role !== "ADMIN") {
    return NextResponse.json({ error: "Data export is restricted to the clinic owner/admin." }, { status: 403 });
  }

  const entity = req.nextUrl.searchParams.get("entity") || "";
  const stamp = new Date().toISOString().slice(0, 10);

  // Full backup — every record type as JSON.
  if (entity === "all") {
    const backup = await getFullBackup();
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="orthocare-backup-${stamp}.json"`,
      },
    });
  }

  const def = CSV_ENTITIES[entity];
  if (!def) {
    return NextResponse.json({ error: `Unknown export "${entity}".` }, { status: 400 });
  }
  const csv = toCsv(await def.build());
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orthocare-${entity}-${stamp}.csv"`,
    },
  });
}
