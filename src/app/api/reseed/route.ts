import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDemo } from "@/lib/seed";

// Daily auto-reseed so the demo never goes stale. Invoked by the Vercel Cron
// defined in vercel.json. Vercel automatically sends `Authorization: Bearer $CRON_SECRET`
// when the CRON_SECRET env var is set, which we verify here.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await seedDemo(prisma);
    return NextResponse.json({ ok: true, reseededAt: new Date().toISOString(), ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
