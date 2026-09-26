// ---------------------------------------------------------------------------
// Messaging layer (WhatsApp-first, SMS fallback).
//
// DEMO MODE: The default provider is `MockProvider`, which does NOT call any
// external API. It simulates delivery so the demo can show the exact message
// that WOULD land on the patient's phone, with a delivery status.
//
// GOING LIVE (see requirements doc §14): implement `BspProvider.send()` against
// your chosen India BSP (AiSensy / Interakt / Wati / Gupshup). Reminders must be
// pre-approved UTILITY templates; capture opt-in at registration; respect the
// 24-hour session window. Then set MESSAGING_PROVIDER=bsp in the environment.
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
  whenText?: string; // e.g. "Tomorrow, 27 Sep at 6:30 PM"
  tokenNo?: number | null;
  detail?: string; // report name, amount text, etc.
}

// Utility-category template bodies (kept short & plain, WhatsApp-friendly).
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
      return `Hello ${c.patientName}, your ${c.detail || "report"} from ${clinic} is ready and attached. Keep it for your records. — ${clinic}`;
    case "RECALL":
      return `Hi ${c.patientName}, it's time for your follow-up${dr} at ${clinic}. ${
        c.detail || ""
      } Reply to book a slot. — ${clinic}`;
    case "DUES":
      return `Hello ${c.patientName}, a gentle reminder of an outstanding balance of ${
        c.detail || ""
      } at ${clinic}. You can pay by UPI at the clinic. Thank you. — ${clinic}`;
    default:
      return `Message from ${clinic}.`;
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
  send(to: string, body: string, optedIn: boolean): Promise<SendResult>;
}

// Default demo provider — simulates a successful WhatsApp delivery.
class MockProvider implements MessageProvider {
  name = "mock-whatsapp";
  async send(to: string, _body: string, optedIn: boolean): Promise<SendResult> {
    if (!to) return { ok: false, status: "FAILED", error: "No phone number" };
    if (!optedIn) return { ok: false, status: "FAILED", error: "Patient has not opted in to WhatsApp" };
    // Simulate a delivered utility template.
    return { ok: true, status: "DELIVERED", providerId: "mock_" + Math.random().toString(36).slice(2, 10) };
  }
}

// Scaffold for the real integration. Fill in when going live.
class BspProvider implements MessageProvider {
  name = "bsp-whatsapp";
  async send(_to: string, _body: string, _optedIn: boolean): Promise<SendResult> {
    // TODO: POST to your BSP's messages endpoint with an approved utility template.
    // return mapped provider response here.
    throw new Error("BspProvider not configured. Set up a BSP and implement send().");
  }
}

export function getProvider(): MessageProvider {
  return process.env.MESSAGING_PROVIDER === "bsp" ? new BspProvider() : new MockProvider();
}
