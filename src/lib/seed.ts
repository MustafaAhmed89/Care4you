import type { PrismaClient } from "@prisma/client";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

// Shared demo seed. Used by the CLI (prisma/seed.ts) and the /api/reseed cron.
// Times are anchored to the clinic's timezone (IST) so the seeded "today" matches
// the app's IST today-range regardless of the server timezone (Vercel = UTC).

const TZ = "Asia/Kolkata";

function nowZoned() {
  return toZonedTime(new Date(), TZ);
}
// "today in IST" at HH:MM, returned as the correct absolute (UTC) instant.
function at(h: number, m = 0) {
  const z = nowZoned();
  return fromZonedTime(new Date(z.getFullYear(), z.getMonth(), z.getDate(), h, m, 0, 0), TZ);
}
// N days ago at noon IST.
function daysAgo(n: number) {
  const z = nowZoned();
  return fromZonedTime(new Date(z.getFullYear(), z.getMonth(), z.getDate() - n, 12, 0, 0, 0), TZ);
}

export async function seedDemo(prisma: PrismaClient) {
  // children first
  await prisma.message.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.physioSession.deleteMany();
  await prisma.physioPackage.deleteMany();
  await prisma.imagingStudy.deleteMany();
  await prisma.rxLine.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.clinic.deleteMany();

  await prisma.clinic.create({
    data: {
      name: "OrthoCure Clinic",
      tagline: "Orthopaedics • Physiotherapy • Digital X-ray",
      address: "415, 2nd Main Rd, 1st Block, RT Nagar, Bengaluru 560032",
      phone: "+91 80 2333 4455",
      logoInitials: "OC",
      brandColor: "#0f8785",
      doctorName: "Dr. Gaurav Sharma",
      nmcRegNo: "KMC/2009/45678",
      gstRegistered: false,
      aerbLicenceNo: "AERB/RSD/2021/BLR/1123",
      aerbRso: "Dr. Gaurav Sharma",
      aerbRenewal: fromZonedTime(new Date(nowZoned().getFullYear() + 1, 3, 30, 12, 0, 0, 0), TZ),
      kpmeRegNo: "KPME/BBMP/2015/7788",
      pharmacyEnabled: false,
    },
  });

  const drGaurav = await prisma.staff.create({
    data: { name: "Dr. Gaurav Sharma", role: "OWNER_DOCTOR", nmcRegNo: "KMC/2009/45678", isProvider: true, phone: "+91 98450 11223" },
  });
  const priya = await prisma.staff.create({ data: { name: "Priya Nair", role: "PHYSIO", isProvider: true, phone: "+91 98860 22334" } });
  const anjali = await prisma.staff.create({ data: { name: "Anjali Rao", role: "PHYSIO", isProvider: true, phone: "+91 99010 33445" } });
  const bharathi = await prisma.staff.create({ data: { name: "Bharathi K", role: "FRONT_DESK", phone: "+91 98455 44556" } });

  const P: Record<string, any> = {};
  const patients: [string, string, string, string, number, string][] = [
    ["ramesh", "Ramesh Kumar", "+91 98861 20001", "M", 54, "Kammanahalli, Bengaluru"],
    ["lakshmi", "Lakshmi Devi", "+91 98861 20002", "F", 61, "RT Nagar, Bengaluru"],
    ["irfan", "Mohammed Irfan", "+91 98861 20003", "M", 34, "Frazer Town, Bengaluru"],
    ["suresh", "Suresh Reddy", "+91 98861 20004", "M", 45, "Hebbal, Bengaluru"],
    ["anita", "Anita Joseph", "+91 98861 20005", "F", 39, "Cooke Town, Bengaluru"],
    ["venkatesh", "Venkatesh N", "+91 98861 20006", "M", 28, "Sanjaynagar, Bengaluru"],
    ["fatima", "Fatima Begum", "+91 98861 20007", "F", 50, "Shivajinagar, Bengaluru"],
    ["arjun", "Arjun Menon", "+91 98861 20008", "M", 31, "Jayamahal, Bengaluru"],
    ["kiran", "Kiran Rao", "+91 98861 20009", "M", 42, "Ganganagar, Bengaluru"],
    ["deepa", "Deepa Shetty", "+91 98861 20010", "F", 47, "RT Nagar, Bengaluru"],
    ["rajesh", "Rajesh Gupta", "+91 98861 20011", "M", 58, "Benson Town, Bengaluru"],
    ["meena", "Meena Iyer", "+91 98861 20012", "F", 52, "Dollars Colony, Bengaluru"],
    ["sunita", "Sunita Sharma", "+91 98861 20013", "F", 36, "Mathikere, Bengaluru"],
    ["prakash", "Prakash Bhat", "+91 98861 20014", "M", 66, "Yelahanka, Bengaluru"],
  ];
  for (const [key, name, phone, gender, age, address] of patients) {
    P[key] = await prisma.patient.create({
      data: {
        name, phone, gender, age, address,
        whatsappOptIn: true, consentStatus: "GRANTED",
        consentAt: daysAgo(Math.floor(Math.random() * 200) + 5),
        createdAt: daysAgo(Math.floor(Math.random() * 400) + 10),
      },
    });
  }

  const appt = (patient: any, provider: any, serviceType: string, time: Date, status: string, source: string, tokenNo: number | null, reason?: string) =>
    prisma.appointment.create({ data: { patientId: patient.id, providerId: provider.id, serviceType, scheduledStart: time, status, source, tokenNo: tokenNo ?? undefined, reason } });

  const aRamesh = await appt(P.ramesh, drGaurav, "CONSULT", at(9, 30), "COMPLETED", "WALK_IN", 1, "Knee pain, follow-up");
  const aLakshmi = await appt(P.lakshmi, drGaurav, "CONSULT", at(9, 50), "COMPLETED", "PHONE", 2, "Right knee osteoarthritis");
  await appt(P.kiran, drGaurav, "CONSULT", at(9, 15), "NO_SHOW", "PHONE", null, "Back pain");
  const aIrfan = await appt(P.irfan, drGaurav, "CONSULT", at(10, 10), "IN_PROGRESS", "WALK_IN", 3, "Lower back pain after lifting");
  await appt(P.suresh, drGaurav, "CONSULT", at(10, 30), "CHECKED_IN", "WHATSAPP", 4, "Shoulder pain");
  await appt(P.anita, drGaurav, "FOLLOWUP", at(10, 45), "CHECKED_IN", "WHATSAPP", 5, "Fracture review");
  await appt(P.venkatesh, drGaurav, "CONSULT", at(11, 0), "CHECKED_IN", "WALK_IN", 6, "Wrist injury (fall)");
  await appt(P.fatima, drGaurav, "CONSULT", at(11, 30), "BOOKED", "PHONE", 7, "Neck pain");
  await appt(P.arjun, drGaurav, "CONSULT", at(12, 0), "BOOKED", "WHATSAPP", 8, "Ankle sprain");
  await appt(P.deepa, priya, "PHYSIO", at(10, 0), "CHECKED_IN", "WALK_IN", 1, "Knee rehab session 9");
  await appt(P.rajesh, priya, "PHYSIO", at(11, 0), "BOOKED", "PHONE", 2, "Back pain session 3");

  const vRamesh = await prisma.visit.create({
    data: {
      patientId: P.ramesh.id, appointmentId: aRamesh.id, providerId: drGaurav.id, date: at(9, 40),
      encounterType: "FOLLOW_UP", complaint: "Persistent right knee pain, worse on stairs.",
      injurySite: "Right knee", injurySide: "RIGHT", diagnosis: "Osteoarthritis, right knee (Grade 2).",
      plan: "Continue physiotherapy. NSAIDs for 5 days. Review in 4 weeks.", followUpWeeks: 4,
    },
  });
  const rxRamesh = await prisma.prescription.create({ data: { visitId: vRamesh.id, advice: "Apply ice after activity. Avoid squatting and stairs where possible." } });
  await prisma.rxLine.createMany({
    data: [
      { prescriptionId: rxRamesh.id, genericName: "Aceclofenac", brandName: "Hifenac", dose: "100 mg", frequency: "1-0-1", duration: "5 days", scheduleFlag: "H" },
      { prescriptionId: rxRamesh.id, genericName: "Paracetamol", brandName: "Dolo", dose: "650 mg", frequency: "SOS", duration: "5 days", scheduleFlag: "NONE" },
      { prescriptionId: rxRamesh.id, genericName: "Calcium + Vitamin D3", brandName: "Shelcal", dose: "500 mg", frequency: "0-0-1", duration: "30 days", scheduleFlag: "NONE" },
    ],
  });

  const vLakshmi = await prisma.visit.create({
    data: {
      patientId: P.lakshmi.id, appointmentId: aLakshmi.id, providerId: drGaurav.id, date: at(9, 58),
      encounterType: "FIRST", complaint: "Right knee pain and stiffness for 6 months.",
      injurySite: "Right knee", injurySide: "RIGHT", diagnosis: "Osteoarthritis, right knee.",
      plan: "Start physiotherapy (10 sessions). NSAIDs. Knee X-ray done. Review in 6 weeks.", followUpWeeks: 6,
    },
  });
  const rxLakshmi = await prisma.prescription.create({ data: { visitId: vLakshmi.id, advice: "Quadriceps strengthening exercises daily." } });
  await prisma.rxLine.createMany({
    data: [
      { prescriptionId: rxLakshmi.id, genericName: "Etoricoxib", brandName: "Etoshine", dose: "90 mg", frequency: "0-0-1", duration: "7 days", scheduleFlag: "H" },
      { prescriptionId: rxLakshmi.id, genericName: "Pantoprazole", brandName: "Pan", dose: "40 mg", frequency: "1-0-0", duration: "7 days", scheduleFlag: "H" },
    ],
  });
  await prisma.imagingStudy.create({
    data: {
      patientId: P.lakshmi.id, visitId: vLakshmi.id, bodyPart: "Right Knee", view: "AP + Lateral", side: "RIGHT",
      studyDate: at(9, 52), reportStatus: "SHARED",
      reportText: "Reduced medial joint space, marginal osteophytes — consistent with Grade 2 osteoarthritis.",
      imagePath: "/samples/sample-xray.svg", sharedAt: at(10, 5),
    },
  });
  await prisma.imagingStudy.create({
    data: {
      patientId: P.venkatesh.id, bodyPart: "Left Wrist", view: "AP + Lateral", side: "LEFT",
      studyDate: at(11, 10), reportStatus: "READY",
      reportText: "No obvious fracture. Soft-tissue swelling over the distal radius.", imagePath: "/samples/sample-xray.svg",
    },
  });
  await prisma.imagingStudy.create({
    data: { patientId: P.irfan.id, bodyPart: "Lumbar Spine", view: "AP + Lateral", side: "NA", studyDate: at(10, 20), reportStatus: "PENDING" },
  });

  const pkgDeepa = await prisma.physioPackage.create({
    data: { patientId: P.deepa.id, name: "Knee Rehabilitation — 10 sessions", totalSessions: 10, sessionsUsed: 8, price: 3500, purchaseDate: daysAgo(24), expiryDate: daysAgo(-6), status: "ACTIVE" },
  });
  for (let i = 0; i < 8; i++) {
    await prisma.physioSession.create({
      data: { packageId: pkgDeepa.id, therapistId: priya.id, date: daysAgo(22 - i * 3), attended: true, painScore: Math.max(1, 7 - i), note: `Session ${i + 1}: ROM improving, pain ${Math.max(1, 7 - i)}/10.` },
    });
  }
  const pkgRajesh = await prisma.physioPackage.create({
    data: { patientId: P.rajesh.id, name: "Lower Back Pain — 10 sessions", totalSessions: 10, sessionsUsed: 2, price: 3500, purchaseDate: daysAgo(6), expiryDate: daysAgo(-54), status: "ACTIVE" },
  });
  for (let i = 0; i < 2; i++) {
    await prisma.physioSession.create({ data: { packageId: pkgRajesh.id, therapistId: priya.id, date: daysAgo(6 - i * 3), attended: true, painScore: 6 - i, note: `Session ${i + 1}.` } });
  }
  await prisma.physioPackage.create({
    data: { patientId: P.meena.id, name: "Shoulder — 6 sessions", totalSessions: 6, sessionsUsed: 6, price: 2400, purchaseDate: daysAgo(40), expiryDate: daysAgo(5), status: "COMPLETED" },
  });

  // Physio assessments — progress over time (drives the progress charts)
  for (const a of [
    { d: 22, pain: 7, score: 30, rom: 90 },
    { d: 12, pain: 5, score: 45, rom: 110 },
    { d: 2, pain: 3, score: 58, rom: 125 },
  ]) {
    await prisma.physioAssessment.create({
      data: {
        patientId: P.deepa.id, packageId: pkgDeepa.id, therapistId: priya.id, date: daysAgo(a.d),
        painScore: a.pain, scaleType: "LEFS", scaleScore: a.score, scaleMax: 80,
        note: `Knee OA rehab review — pain ${a.pain}/10, LEFS ${a.score}/80.`,
        rom: { create: [{ joint: "Right Knee Flexion", degrees: a.rom }] },
      },
    });
  }
  for (const a of [
    { d: 6, pain: 6, score: 40, rom: 40 },
    { d: 0, pain: 5, score: 32, rom: 50 },
  ]) {
    await prisma.physioAssessment.create({
      data: {
        patientId: P.rajesh.id, packageId: pkgRajesh.id, therapistId: priya.id, date: daysAgo(a.d),
        painScore: a.pain, scaleType: "ODI", scaleScore: a.score, scaleMax: 100,
        note: `Low back pain rehab — ODI ${a.score}% (lower is better).`,
        rom: { create: [{ joint: "Lumbar Flexion", degrees: a.rom }] },
      },
    });
  }

  const makeInvoice = async ({ patient, visitId, lines, payments, status, notes }: any) => {
    const inv = await prisma.invoice.create({ data: { patientId: patient.id, visitId: visitId ?? null, date: new Date(), status, notes } });
    for (const l of lines) {
      await prisma.invoiceLine.create({
        data: { invoiceId: inv.id, itemType: l.itemType, description: l.description, qty: l.qty ?? 1, unitPrice: l.unitPrice, gstExempt: l.gstExempt ?? true, hsnCode: l.hsnCode ?? null, gstRate: l.gstRate ?? 0, lineTotal: (l.qty ?? 1) * l.unitPrice },
      });
    }
    for (const p of payments ?? []) {
      await prisma.payment.create({ data: { invoiceId: inv.id, amount: p.amount, mode: p.mode, paidAt: p.paidAt ?? new Date(), collectedById: bharathi.id } });
    }
    return inv;
  };

  await makeInvoice({ patient: P.ramesh, visitId: vRamesh.id, lines: [{ itemType: "CONSULT", description: "Consultation — Dr. Gaurav Sharma", unitPrice: 500 }], payments: [{ amount: 500, mode: "CASH", paidAt: at(9, 45) }], status: "PAID" });
  await makeInvoice({ patient: P.lakshmi, visitId: vLakshmi.id, lines: [{ itemType: "CONSULT", description: "Consultation — Dr. Gaurav Sharma", unitPrice: 500 }, { itemType: "XRAY", description: "X-ray — Right Knee (AP + Lateral)", unitPrice: 400 }], payments: [{ amount: 900, mode: "UPI", paidAt: at(10, 6) }], status: "PAID" });
  await makeInvoice({ patient: P.venkatesh, lines: [{ itemType: "XRAY", description: "X-ray — Left Wrist (AP + Lateral)", unitPrice: 400 }], payments: [{ amount: 400, mode: "CARD", paidAt: at(11, 15) }], status: "PAID" });
  await makeInvoice({ patient: P.deepa, lines: [{ itemType: "PHYSIO", description: "Physiotherapy session (Knee Rehab)", unitPrice: 350 }], payments: [{ amount: 350, mode: "CASH", paidAt: at(10, 30) }], status: "PAID" });
  await makeInvoice({ patient: P.suresh, lines: [{ itemType: "CONSULT", description: "Consultation — Dr. Gaurav Sharma", unitPrice: 500 }], payments: [{ amount: 200, mode: "CASH", paidAt: at(10, 35) }], status: "PARTIAL", notes: "Balance to be paid on next visit." });
  await makeInvoice({ patient: P.meena, lines: [{ itemType: "PHYSIO", description: "Physiotherapy session", unitPrice: 350 }], payments: [], status: "UNPAID", notes: "Pending from last visit." });

  const msg = (patient: any, type: string, body: string, status: string, sentAt: Date) =>
    prisma.message.create({ data: { patientId: patient.id, type, body, status, sentAt, channel: "WHATSAPP" } });
  await msg(P.suresh, "CONFIRM", "Hello Suresh Reddy, your appointment with Dr. Gaurav Sharma at OrthoCure Clinic is confirmed for today, 10:30 AM. Token: 4. Reply to reschedule. — OrthoCure Clinic", "DELIVERED", at(8, 5));
  await msg(P.anita, "REMINDER_2H", "See you soon, Anita Joseph! Your appointment with Dr. Gaurav Sharma at OrthoCure Clinic is at 10:45 AM. Your token is 5. — OrthoCure Clinic", "READ", at(8, 45));
  await msg(P.arjun, "REMINDER_24H", "Reminder: Arjun Menon, you have an appointment with Dr. Gaurav Sharma at OrthoCure Clinic tomorrow at 12:00 PM. Reply CANCEL or RESCHEDULE if you can't make it. — OrthoCure Clinic", "DELIVERED", daysAgo(0));
  await msg(P.lakshmi, "REPORT_SHARE", "Hello Lakshmi Devi, your Right Knee X-ray from OrthoCure Clinic is ready and attached. Keep it for your records. — OrthoCure Clinic", "DELIVERED", at(10, 5));
  await msg(P.deepa, "RECALL", "Hi Deepa Shetty, your Knee Rehabilitation package has 2 sessions left and expires soon. Reply to book your next session. — OrthoCure Clinic", "SENT", at(9, 0));

  const patientCount = await prisma.patient.count();
  const apptCount = await prisma.appointment.count();
  return { patients: patientCount, appointments: apptCount };
}
