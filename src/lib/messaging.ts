// ---------------------------------------------------------------------------
// Messaging layer (WhatsApp-first, SMS fallback).
//
// Providers:
//  - MockProvider  (default): no external calls; simulates delivery so the demo
//    shows the exact message that WOULD land, with a status.
//  - MetaCloudProvider: real WhatsApp Business Cloud API (graph.facebook.com).
//    Business-initiated messages MUST be pre-approved TEMPLATE messages, so each
//    MessageType maps to a template name + ordered body parameters. Create matching
//    templates in Meta Business Manager (see WHATSAPP.md), then set:
//      MESSAGING_PROVIDER=meta
//      WHATSAPP_PHONE_NUMBER_ID=...
//      WHATSAPP_TOKEN=...            (permanent access token)
//      WHATSAPP_API_VERSION=v21.0   (optional)
//      WHATSAPP_TEMPLATE_LANG=en    (optional; must match your templates)
//      WA_TPL_CONFIRM=... etc.      (optional name overrides)
// ---------------------------------------------------------------------------

export type MessageType =
  | "CONFIRM"
  | "REMINDER_24H"
  | "REMINDER_2H"
  | "REPORT_SHARE"
  | "RECALL"
  | "DUES";

export interface TemplateContext {
  patientName: string;
  clinicName: string;
  clinicPhone?: string | null;
  doctorName?: string | null;
  whenText?: string;
  tokenNo?: number | null;
  detail?: string;
}

// Human-readable body — used for the outbox log, the in-app preview, and mock sends.
export function buildBody(type: MessageType, c: TemplateContext): string {
  const clinic = c.clinicName;
  const dr = c.doctorName ? ` with ${c.doctorName}` : "";
  switch (type) {
    case "CONFIRM":
      return `Hello ${c.patientName}, your appointment${dr} at ${clinic} is confirmed for ${c.whenText}.${
        c.tokenNo ? ` Token: ${c.tokenNo}.` : ""
      } Reply to reschedule. — ${clinic}`;
    case "REMINDER_24H":
      return `Reminder: ${c.patientName}, you have an appointment${dr} at ${clinic} ${c.whenText}. Please reply CANCEL or RESCHEDULE if you can't make it. — ${clinic}`;
    case "REMINDER_2H":
      return `See you soon, ${c.patientName}! Your appointment${dr} at ${clinic} is at ${c.whenText}.${
        c.tokenNo ? ` Your token is ${c.tokenNo}.` : ""
      } — ${clinic}`;
    case "REPORT_SHARE":
      return `Hello ${c.patientName}, your ${c.detail || "report"} from ${clinic} is ready. Keep it for your records. — ${clinic}`;
    case "RECALL":
      return `Hi ${c.patientName}, it's time for your follow-up${dr} at ${clinic}. ${c.detail || ""} Reply to book a slot. — ${clinic}`;
    case "DUES":
      return `Hello ${c.patientName}, a gentle reminder of an outstanding balance of ${
        c.detail || ""
      } at ${clinic}. You can pay by UPI at the clinic. Thank you. — ${clinic}`;
    default:
      return `Message from ${clinic}.`;
  }
}

export interface OutboundMessage {
  type: MessageType;
  body: string;
  template: { name: string; language: string; params: string[] };
}

// Meta rejects empty template params — coalesce to a safe placeholder.
function ne(v: unknown, fallback = "-"): string {
  const s = (v ?? "").toString().trim();
  return s || fallback;
}
function tpl(envKey: string, def: string): string {
  return process.env[envKey] || def;
}

// Maps a message type to its WhatsApp template + ordered body params.
// IMPORTANT: the param order below MUST match the {{1}},{{2}},… in your Meta template.
export function buildMessage(type: MessageType, c: TemplateContext): OutboundMessage {
  const body = buildBody(type, c);
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || "en";
  const name = ne(c.patientName, "there");
  const dr = ne(c.doctorName, "our doctor");
  const clinic = ne(c.clinicName, "the clinic");
  const when = ne(c.whenText, "your scheduled time");
  const token = ne(c.tokenNo, "-");
  const detail = ne(c.detail, "-");

  const t = (n: string, language: string, params: string[]): OutboundMessage => ({ type, body, template: { name: n, language, params } });

  switch (type) {
    case "CONFIRM":
      return t(tpl("WA_TPL_CONFIRM", "appt_confirmation"), lang, [name, dr, clinic, when, token]);
    case "REMINDER_24H":
      return t(tpl("WA_TPL_REMINDER_24H", "appt_reminder_24h"), lang, [name, dr, clinic, when]);
    case "REMINDER_2H":
      return t(tpl("WA_TPL_REMINDER_2H", "appt_reminder_2h"), lang, [name, dr, clinic, when, token]);
    case "REPORT_SHARE":
      return t(tpl("WA_TPL_REPORT_SHARE", "report_ready"), lang, [name, detail, clinic]);
    case "RECALL":
      return t(tpl("WA_TPL_RECALL", "followup_recall"), lang, [name, dr, clinic]);
    case "DUES":
      return t(tpl("WA_TPL_DUES", "payment_reminder"), lang, [name, detail, clinic]);
    default:
      return t("appt_confirmation", lang, [name, dr, clinic, when, token]);
  }
}

export interface SendResult {
  ok: boolean;
  status: "SENT" | "DELIVERED" | "READ" | "FAILED";
  providerId?: string;
  error?: string;
}

export interface MessageProvider {
  name: string;
  send(to: string, msg: OutboundMessage, optedIn: boolean): Promise<SendResult>;
}

// Strip to E.164 digits (no "+"/spaces). Assumes the stored number includes the country code.
export function normalizePhone(raw: string): string {
  return (raw || "").replace(/\D/g, "");
}

class MockProvider implements MessageProvider {
  name = "mock-whatsapp";
  async send(to: string, _msg: OutboundMessage, optedIn: boolean): Promise<SendResult> {
    if (!to) return { ok: false, status: "FAILED", error: "No phone number" };
    if (!optedIn) return { ok: false, status: "FAILED", error: "Patient has not opted in to WhatsApp" };
    return { ok: true, status: "DELIVERED", providerId: "mock_" + Math.random().toString(36).slice(2, 10) };
  }
}

class MetaCloudProvider implements MessageProvider {
  name = "meta-cloud";
  async send(to: string, msg: OutboundMessage, optedIn: boolean): Promise<SendResult> {
    if (!optedIn) return { ok: false, status: "FAILED", error: "Patient has not opted in to WhatsApp" };
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const version = process.env.WHATSAPP_API_VERSION || "v21.0";
    if (!token || !phoneId) {
      return { ok: false, status: "FAILED", error: "WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID not configured" };
    }
    const num = normalizePhone(to);
    if (!num) return { ok: false, status: "FAILED", error: "Invalid phone number" };

    const payload = {
      messaging_product: "whatsapp",
      to: num,
      type: "template",
      template: {
        name: msg.template.name,
        language: { code: msg.template.language },
        components: [
          {
            type: "body",
            parameters: msg.template.params.map((text) => ({ type: "text", text })),
          },
        ],
      },
    };

    try {
      const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, status: "FAILED", error: data?.error?.message || `HTTP ${res.status}` };
      }
      // Delivery/read status arrive later via webhooks (not implemented) — mark as SENT.
      return { ok: true, status: "SENT", providerId: data?.messages?.[0]?.id };
    } catch (e: any) {
      return { ok: false, status: "FAILED", error: String(e?.message ?? e) };
    }
  }
}

export function getProvider(): MessageProvider {
  return process.env.MESSAGING_PROVIDER === "meta" ? new MetaCloudProvider() : new MockProvider();
}
