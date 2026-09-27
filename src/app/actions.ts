"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { formatInTimeZone } from "date-fns-tz";
import { CLINIC_TZ } from "@/lib/day";
import { ROLE_COOKIE_NAME } from "@/lib/session";
import { buildMessage, getProvider, type MessageType } from "@/lib/messaging";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function getClinic() {
  return prisma.clinic.findFirst();
}

// Public base URL for patient-facing links (F-03 reschedule/cancel). Override with
// APP_BASE_URL in the environment; defaults to the production demo domain.
function appBaseUrl(): string {
  return (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://care4you.vercel.app").replace(/\/+$/, "");
}

// ---- role switch (demo auth) ----
export async function setRole(formData: FormData) {
  const role = String(formData.get("role") || "OWNER_DOCTOR");
  cookies().set(ROLE_COOKIE_NAME, role, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/", "layout");
}

// ---- queue ----
export async function registerWalkIn(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const providerId = String(formData.get("providerId") || "");
  const serviceType = String(formData.get("serviceType") || "CONSULT");
  const reason = String(formData.get("reason") || "").trim() || null;
  const source = String(formData.get("source") || "WALK_IN");
  if (!name || !phone || !providerId) return;

  // find existing patient by phone, else create
  let patient = await prisma.patient.findFirst({ where: { phone, softDeleted: false } });
  if (!patient) {
    patient = await prisma.patient.create({
      data: { name, phone, whatsappOptIn: true, consentStatus: "GRANTED", consentAt: new Date() },
    });
  }

  const { start, end } = todayRange();
  const count = await prisma.appointment.count({
    where: { providerId, tokenNo: { not: null }, scheduledStart: { gte: start, lte: end } },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      providerId,
      serviceType,
      scheduledStart: new Date(),
      status: "CHECKED_IN",
      source,
      tokenNo: count + 1,
      reason,
    },
  });
  revalidatePath("/");
}

export async function updateApptStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || !status) return;
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/");
}

// ---- visit + prescription ----
export async function createVisit(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const providerId = String(formData.get("providerId"));
  const appointmentId = String(formData.get("appointmentId") || "") || null;
  const encounterType = String(formData.get("encounterType") || "FIRST");
  const complaint = String(formData.get("complaint") || "") || null;
  const injurySite = String(formData.get("injurySite") || "") || null;
  const injurySide = String(formData.get("injurySide") || "NA") || null;
  const diagnosis = String(formData.get("diagnosis") || "") || null;
  const plan = String(formData.get("plan") || "") || null;
  const followUpWeeksRaw = String(formData.get("followUpWeeks") || "");
  const followUpWeeks = followUpWeeksRaw ? parseInt(followUpWeeksRaw, 10) : null;
  const advice = String(formData.get("advice") || "") || null;
  let lines: any[] = [];
  try {
    lines = JSON.parse(String(formData.get("lines") || "[]"));
  } catch {}

  const visit = await prisma.visit.create({
    data: {
      patientId,
      providerId,
      appointmentId: appointmentId || undefined,
      encounterType,
      complaint,
      injurySite,
      injurySide,
      diagnosis,
      plan,
      followUpWeeks,
    },
  });

  const validLines = lines.filter((l) => l && l.genericName && l.genericName.trim());
  if (validLines.length || advice) {
    const rx = await prisma.prescription.create({ data: { visitId: visit.id, advice } });
    if (validLines.length) {
      await prisma.rxLine.createMany({
        data: validLines.map((l) => ({
          prescriptionId: rx.id,
          genericName: l.genericName,
          brandName: l.brandName || null,
          dose: l.dose || null,
          frequency: l.frequency || null,
          duration: l.duration || null,
          scheduleFlag: l.scheduleFlag || "NONE",
        })),
      });
    }
  }

  if (appointmentId) {
    await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "COMPLETED" } });
  }
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/");
  redirect(`/patients/${patientId}?saved=visit`);
}

// ---- billing ----
export async function createInvoice(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const visitId = String(formData.get("visitId") || "") || null;
  let lines: any[] = [];
  try {
    lines = JSON.parse(String(formData.get("lines") || "[]"));
  } catch {}
  const payAmount = parseInt(String(formData.get("payAmount") || "0"), 10) || 0;
  const payMode = String(formData.get("payMode") || "CASH");
  if (!patientId || !lines.length) return;

  const clinic = await getClinic();
  const gstOn = !!clinic?.gstRegistered;

  const inv = await prisma.invoice.create({ data: { patientId, visitId: visitId || undefined, status: "UNPAID" } });
  let total = 0;
  for (const l of lines) {
    const qty = parseInt(l.qty || "1", 10) || 1;
    const unitPrice = parseInt(l.unitPrice || "0", 10) || 0;
    const taxable = gstOn && (l.itemType === "PHARMACY" || l.itemType === "OTHER");
    const lineTotal = qty * unitPrice;
    total += lineTotal;
    await prisma.invoiceLine.create({
      data: {
        invoiceId: inv.id,
        itemType: l.itemType || "OTHER",
        description: l.description || l.itemType || "Item",
        qty,
        unitPrice,
        gstExempt: !taxable,
        gstRate: taxable ? Number(l.gstRate || 5) : 0,
        hsnCode: taxable ? l.hsnCode || null : null,
        lineTotal,
      },
    });
  }

  if (payAmount > 0) {
    await prisma.payment.create({ data: { invoiceId: inv.id, amount: payAmount, mode: payMode } });
  }
  const status = payAmount >= total ? "PAID" : payAmount > 0 ? "PARTIAL" : "UNPAID";
  await prisma.invoice.update({ where: { id: inv.id }, data: { status } });

  revalidatePath("/billing");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/billing?saved=invoice`);
}

export async function addPayment(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId"));
  const amount = parseInt(String(formData.get("amount") || "0"), 10) || 0;
  const mode = String(formData.get("mode") || "CASH");
  if (!invoiceId || amount <= 0) return;

  await prisma.payment.create({ data: { invoiceId, amount, mode } });
  const inv = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { lines: true, payments: true } });
  if (inv) {
    const total = inv.lines.reduce((s, l) => s + l.lineTotal, 0);
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const status = paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
  }
  revalidatePath("/billing");
}

// ---- physio ----
export async function recordPhysioSession(formData: FormData) {
  const packageId = String(formData.get("packageId"));
  const therapistId = String(formData.get("therapistId") || "") || null;
  const painScore = parseInt(String(formData.get("painScore") || ""), 10);
  const note = String(formData.get("note") || "") || null;
  if (!packageId) return;

  const pkg = await prisma.physioPackage.findUnique({ where: { id: packageId } });
  if (!pkg || pkg.sessionsUsed >= pkg.totalSessions) return;

  await prisma.physioSession.create({
    data: {
      packageId,
      therapistId: therapistId || undefined,
      attended: true,
      painScore: Number.isNaN(painScore) ? null : painScore,
      note,
    },
  });
  const used = pkg.sessionsUsed + 1;
  await prisma.physioPackage.update({
    where: { id: packageId },
    data: { sessionsUsed: used, status: used >= pkg.totalSessions ? "COMPLETED" : "ACTIVE" },
  });
  revalidatePath("/physio");
}

export async function createPhysioPackage(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const name = String(formData.get("name") || "Physiotherapy package");
  const totalSessions = parseInt(String(formData.get("totalSessions") || "10"), 10) || 10;
  const price = parseInt(String(formData.get("price") || "0"), 10) || 0;
  if (!patientId) return;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 60);
  await prisma.physioPackage.create({
    data: { patientId, name, totalSessions, price, expiryDate: expiry, status: "ACTIVE" },
  });
  revalidatePath("/physio");
  revalidatePath(`/patients/${patientId}`);
}

export async function createAssessment(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  if (!patientId) return;
  const packageId = String(formData.get("packageId") || "") || null;
  const therapistId = String(formData.get("therapistId") || "") || null;
  const painRaw = String(formData.get("painScore") || "");
  const painScore = painRaw === "" ? null : Math.max(0, Math.min(10, parseInt(painRaw, 10) || 0));
  const scaleType = String(formData.get("scaleType") || "NONE");
  const scaleScoreRaw = String(formData.get("scaleScore") || "");
  const scaleScore = scaleScoreRaw === "" ? null : parseInt(scaleScoreRaw, 10);
  const scaleMaxRaw = String(formData.get("scaleMax") || "");
  const scaleMax = scaleMaxRaw === "" ? null : parseInt(scaleMaxRaw, 10);
  const note = String(formData.get("note") || "") || null;

  let rom: any[] = [];
  try {
    rom = JSON.parse(String(formData.get("rom") || "[]"));
  } catch {}
  const validRom = rom.filter((r) => r && r.joint && String(r.joint).trim() && r.degrees !== "" && r.degrees != null);

  const a = await prisma.physioAssessment.create({
    data: {
      patientId,
      packageId: packageId || undefined,
      therapistId: therapistId || undefined,
      painScore: painScore ?? undefined,
      scaleType,
      scaleScore: scaleScore ?? undefined,
      scaleMax: scaleMax ?? undefined,
      note,
    },
  });
  if (validRom.length) {
    await prisma.physioRomEntry.createMany({
      data: validRom.map((r) => ({ assessmentId: a.id, joint: String(r.joint), degrees: parseInt(String(r.degrees), 10) || 0 })),
    });
  }
  revalidatePath(`/patients/${patientId}/physio`);
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/physio");
  redirect(`/patients/${patientId}/physio?saved=assessment`);
}

// ---- referral letters ----
export async function createReferral(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const referToName = String(formData.get("referToName") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  if (!patientId || !referToName || !reason) return;

  let providerId = String(formData.get("providerId") || "") || null;
  if (!providerId) {
    const doctor = await prisma.staff.findFirst({ where: { role: "OWNER_DOCTOR" } });
    providerId = doctor?.id ?? null;
  }
  if (!providerId) return;

  const visitId = String(formData.get("visitId") || "") || null;
  const referToFacility = String(formData.get("referToFacility") || "").trim() || null;
  const specialty = String(formData.get("specialty") || "").trim() || null;
  const urgency = String(formData.get("urgency") || "ROUTINE") === "URGENT" ? "URGENT" : "ROUTINE";
  const clinicalSummary = String(formData.get("clinicalSummary") || "").trim() || null;
  const medications = String(formData.get("medications") || "").trim() || null;

  const referral = await prisma.referral.create({
    data: {
      patientId,
      providerId,
      visitId: visitId || undefined,
      referToName,
      referToFacility,
      specialty,
      urgency,
      reason,
      clinicalSummary,
      medications,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  redirect(`/referral/${referral.id}`);
}

// ---- imaging ----
export async function uploadStudy(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const bodyPart = String(formData.get("bodyPart") || "").trim();
  const view = String(formData.get("view") || "") || null;
  const side = String(formData.get("side") || "NA");
  const reportText = String(formData.get("reportText") || "") || null;
  if (!patientId || !bodyPart) return;

  // Store the image as a base64 data URL so it works on serverless (Vercel) with no
  // object storage. For production scale, swap this for Vercel Blob / S3 and store a URL.
  let imagePath: string | null = null;
  const file = formData.get("file") as File | null;
  if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";
    imagePath = `data:${mime};base64,${bytes.toString("base64")}`;
  }

  await prisma.imagingStudy.create({
    data: { patientId, bodyPart, view, side, reportText, reportStatus: "READY", imagePath },
  });
  revalidatePath("/imaging");
  revalidatePath(`/patients/${patientId}`);
}

export async function shareStudy(formData: FormData) {
  const studyId = String(formData.get("studyId"));
  if (!studyId) return;
  const study = await prisma.imagingStudy.findUnique({ where: { id: studyId }, include: { patient: true } });
  if (!study) return;
  await prisma.imagingStudy.update({ where: { id: studyId }, data: { reportStatus: "SHARED", sharedAt: new Date() } });
  await sendMessageInternal(study.patientId, "REPORT_SHARE", null, `${study.bodyPart} X-ray`);
  revalidatePath("/imaging");
  revalidatePath(`/patients/${study.patientId}`);
}

// ---- imaging orders + AERB register (F-09 / F-12) ----
// Doctor places an imaging order (region / view / side); it lands in the technician worklist.
export async function createImagingOrder(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const region = String(formData.get("region") || "").trim();
  if (!patientId || !region) return;

  const view = String(formData.get("view") || "").trim() || null;
  const side = String(formData.get("side") || "NA");
  const note = String(formData.get("note") || "").trim() || null;

  let orderedById = String(formData.get("orderedById") || "") || null;
  if (!orderedById) {
    const doctor = await prisma.staff.findFirst({ where: { role: "OWNER_DOCTOR" } });
    orderedById = doctor?.id ?? null;
  }
  if (!orderedById) return;

  // Link to the patient's most recent visit, if any ("linked to the visit/injury").
  const lastVisit = await prisma.visit.findFirst({ where: { patientId }, orderBy: { date: "desc" } });

  await prisma.imagingOrder.create({
    data: { patientId, orderedById, region, view, side, note, visitId: lastVisit?.id ?? undefined },
  });
  revalidatePath("/imaging");
  revalidatePath(`/patients/${patientId}`);
}

export async function cancelImagingOrder(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.imagingOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/imaging");
}

// Technician captures an ordered study — attaches the image + exposure details; the order
// is fulfilled and the study lands in the log / AERB register.
export async function captureImagingStudy(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) return;
  const order = await prisma.imagingOrder.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "ORDERED") return;

  const machineModel = String(formData.get("machineModel") || "").trim() || null;
  const kvpN = parseInt(String(formData.get("kvp") || ""), 10);
  const masN = parseInt(String(formData.get("mas") || ""), 10);
  const kvp = Number.isNaN(kvpN) ? null : kvpN;
  const mas = Number.isNaN(masN) ? null : masN;
  const operatorId = String(formData.get("operatorId") || "") || null;
  const reportText = String(formData.get("reportText") || "").trim() || null;

  // Base64 data URL — serverless-safe, no object storage (see uploadStudy).
  let imagePath: string | null = null;
  const file = formData.get("file") as File | null;
  if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";
    imagePath = `data:${mime};base64,${bytes.toString("base64")}`;
  }

  await prisma.imagingStudy.create({
    data: {
      patientId: order.patientId,
      visitId: order.visitId ?? undefined,
      orderId: order.id,
      bodyPart: order.region,
      view: order.view,
      side: order.side,
      reportText,
      reportStatus: reportText ? "READY" : "PENDING",
      imagePath,
      machineModel,
      kvp: kvp ?? undefined,
      mas: mas ?? undefined,
      operatorId: operatorId || undefined,
    },
  });
  await prisma.imagingOrder.update({ where: { id: order.id }, data: { status: "CAPTURED" } });
  revalidatePath("/imaging");
  revalidatePath("/imaging/register");
  revalidatePath(`/patients/${order.patientId}`);
}

// ---- messaging ----
async function sendMessageInternal(patientId: string, type: MessageType, appointmentId: string | null, detail?: string) {
  const [clinic, patient, appt] = await Promise.all([
    getClinic(),
    prisma.patient.findUnique({ where: { id: patientId } }),
    appointmentId ? prisma.appointment.findUnique({ where: { id: appointmentId } }) : Promise.resolve(null),
  ]);
  if (!patient || !clinic) return;

  const whenText = appt ? formatInTimeZone(new Date(appt.scheduledStart), CLINIC_TZ, "d MMM 'at' h:mm a") : "";
  const manageUrl = appt ? `${appBaseUrl()}/appt/${appt.id}` : undefined;
  const msg = buildMessage(type, {
    patientName: patient.name,
    clinicName: clinic.name,
    clinicPhone: clinic.phone,
    doctorName: clinic.doctorName,
    whenText,
    tokenNo: appt?.tokenNo ?? null,
    detail,
    manageUrl,
  });

  const provider = getProvider();
  const result = await provider.send(patient.phone, msg, patient.whatsappOptIn);

  await prisma.message.create({
    data: {
      patientId,
      appointmentId: appointmentId || undefined,
      channel: "WHATSAPP",
      type,
      body: msg.body,
      status: result.status,
      providerId: result.providerId ?? undefined,
      sentAt: result.ok ? new Date() : null,
    },
  });
}

export async function sendMessage(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const type = String(formData.get("type") || "REMINDER_24H") as MessageType;
  const appointmentId = String(formData.get("appointmentId") || "") || null;
  const detail = String(formData.get("detail") || "") || undefined;
  if (!patientId) return;
  await sendMessageInternal(patientId, type, appointmentId, detail);
  revalidatePath("/messages");
  revalidatePath("/");
}

// ---- reschedule / cancel (F-03) ----
// Public, login-free: called from the patient's WhatsApp link page (/appt/[id]).
export async function respondToAppointment(formData: FormData) {
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "");
  const note = String(formData.get("note") || "").trim() || null;
  if (!id || !["CONFIRM", "RESCHEDULE", "CANCEL"].includes(action)) return;

  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) return;
  // Once the patient has arrived or the visit is over, the link is read-only.
  if (["CHECKED_IN", "IN_PROGRESS", "COMPLETED"].includes(appt.status)) return;

  const map: Record<string, { patientResponse: string; status: string; handled: boolean }> = {
    CONFIRM: { patientResponse: "CONFIRMED", status: "CONFIRMED", handled: true },
    RESCHEDULE: { patientResponse: "RESCHEDULE", status: "RESCHEDULED", handled: false },
    CANCEL: { patientResponse: "CANCELLED", status: "CANCELLED", handled: false },
  };
  const next = map[action];

  await prisma.appointment.update({
    where: { id },
    data: {
      status: next.status,
      patientResponse: next.patientResponse,
      responseNote: action === "CONFIRM" ? null : note,
      respondedAt: new Date(),
      requestHandled: next.handled,
    },
  });

  revalidatePath(`/appt/${id}`);
  revalidatePath("/");
}

// Desk marks a reschedule/cancel request as actioned (slot refilled / patient rebooked).
export async function markRequestHandled(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.appointment.update({ where: { id }, data: { requestHandled: true } });
  revalidatePath("/");
}

// ---- settings ----
export async function updateClinic(formData: FormData) {
  const clinic = await getClinic();
  if (!clinic) return;
  await prisma.clinic.update({
    where: { id: clinic.id },
    data: {
      name: String(formData.get("name") || clinic.name),
      tagline: String(formData.get("tagline") || "") || null,
      address: String(formData.get("address") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      doctorName: String(formData.get("doctorName") || "") || null,
      nmcRegNo: String(formData.get("nmcRegNo") || "") || null,
      logoInitials: String(formData.get("logoInitials") || clinic.logoInitials).slice(0, 3),
      gstRegistered: formData.get("gstRegistered") === "on",
      gstin: String(formData.get("gstin") || "") || null,
      aerbLicenceNo: String(formData.get("aerbLicenceNo") || "") || null,
      pharmacyEnabled: formData.get("pharmacyEnabled") === "on",
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/settings");
}
