import crypto from "crypto";
import { prisma } from "@/lib/db";

// Meta WhatsApp webhook.
//  - GET  : verification handshake (echoes hub.challenge if hub.verify_token matches).
//  - POST : delivery/read status callbacks -> updates Message.status by wamid (providerId).
// Config: WHATSAPP_VERIFY_TOKEN (required for GET), WHATSAPP_APP_SECRET (recommended:
// verifies the X-Hub-Signature-256 on POSTs). Subscribe the app to the "messages" field
// and set the callback URL to <site>/api/whatsapp/webhook. See WHATSAPP.md.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — verification handshake
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verify = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && verify && token === verify) {
    return new Response(challenge ?? "", { status: 200, headers: { "content-type": "text/plain" } });
  }
  return new Response("Forbidden", { status: 403 });
}

function verifyHmac(raw: string, secret: string, sigHeader: string): boolean {
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  try {
    const a = Buffer.from(sigHeader);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const RANK: Record<string, number> = { SENT: 1, DELIVERED: 2, READ: 3 };
function mapStatus(s: string): string | null {
  switch (s) {
    case "sent": return "SENT";
    case "delivered": return "DELIVERED";
    case "read": return "READ";
    case "failed": return "FAILED";
    default: return null;
  }
}

// POST — status callbacks
export async function POST(req: Request) {
  const raw = await req.text();

  const secret = process.env.WHATSAPP_APP_SECRET;
  if (secret) {
    const sig = req.headers.get("x-hub-signature-256") || "";
    if (!verifyHmac(raw, secret, sig)) {
      return new Response("invalid signature", { status: 401 });
    }
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const statuses: { id: string; status: string }[] = [];
  for (const entry of body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      for (const st of change?.value?.statuses ?? []) {
        if (st?.id && st?.status) statuses.push({ id: st.id, status: st.status });
      }
    }
  }

  for (const s of statuses) {
    const next = mapStatus(s.status);
    if (!next) continue;
    const msg = await prisma.message.findFirst({ where: { providerId: s.id } });
    if (!msg) continue;
    if (next === "FAILED") {
      await prisma.message.update({ where: { id: msg.id }, data: { status: "FAILED" } });
      continue;
    }
    // Only advance status forward (sent -> delivered -> read); never downgrade.
    if ((RANK[next] ?? 0) > (RANK[msg.status] ?? 0)) {
      await prisma.message.update({ where: { id: msg.id }, data: { status: next } });
    }
  }

  // Always 200 quickly so Meta doesn't retry.
  return new Response("ok", { status: 200 });
}
