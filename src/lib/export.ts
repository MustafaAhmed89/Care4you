import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "./db";
import { CLINIC_TZ } from "./day";

// Data export / backup (F-26). Dates rendered in the clinic timezone (IST) for CSV,
// so spreadsheets read naturally regardless of the (UTC) server.
const dt = (d: Date | null | undefined) => (d ? formatInTimeZone(new Date(d), CLINIC_TZ, "yyyy-MM-dd HH:mm") : "");
const day = (d: Date | null | undefined) => (d ? formatInTimeZone(new Date(d), CLINIC_TZ, "yyyy-MM-dd") : "");

// Each CSV export: a label (for the UI) and a builder that returns flat rows.
export const CSV_ENTITIES: Record<string, { label: string; build: () => Promise<Record<string, unknown>[]> }> = {
  patients: {
    label: "Patients",
    build: async () =>
      (await prisma.patient.findMany({ orderBy: { name: "asc" } })).map((p) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        gender: p.gender ?? "",
        age: p.age ?? "",
        address: p.address ?? "",
        abha: p.abhaNumber ?? "",
        whatsappOptIn: p.whatsappOptIn,
        consent: p.consentStatus,
        registered: day(p.createdAt),
      })),
  },
  appointments: {
    label: "Appointments",
    build: async () =>
      (await prisma.appointment.findMany({ include: { patient: true, provider: true }, orderBy: { scheduledStart: "desc" } })).map((a) => ({
        id: a.id,
        scheduledStart: dt(a.scheduledStart),
        patient: a.patient.name,
        phone: a.patient.phone,
        provider: a.provider.name,
        serviceType: a.serviceType,
        status: a.status,
        source: a.source,
        tokenNo: a.tokenNo ?? "",
        reason: a.reason ?? "",
        patientResponse: a.patientResponse ?? "",
      })),
  },
  visits: {
    label: "Visits",
    build: async () =>
      (await prisma.visit.findMany({ include: { patient: true, provider: true }, orderBy: { date: "desc" } })).map((v) => ({
        id: v.id,
        date: dt(v.date),
        patient: v.patient.name,
        provider: v.provider.name,
        type: v.encounterType,
        complaint: v.complaint ?? "",
        diagnosis: v.diagnosis ?? "",
        plan: v.plan ?? "",
        followUpWeeks: v.followUpWeeks ?? "",
      })),
  },
  invoices: {
    label: "Invoices",
    build: async () =>
      (await prisma.invoice.findMany({ include: { patient: true, lines: true, payments: true }, orderBy: { date: "desc" } })).map((inv) => {
        const total = inv.lines.reduce((s, l) => s + l.lineTotal, 0);
        const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
        return {
          id: inv.id,
          date: day(inv.date),
          patient: inv.patient.name,
          status: inv.status,
          total,
          paid,
          balance: total - paid,
          items: inv.lines.map((l) => l.description).join("; "),
        };
      }),
  },
  payments: {
    label: "Payments",
    build: async () =>
      (await prisma.payment.findMany({ include: { invoice: { include: { patient: true } } }, orderBy: { paidAt: "desc" } })).map((p) => ({
        id: p.id,
        paidAt: dt(p.paidAt),
        patient: p.invoice.patient.name,
        invoiceId: p.invoiceId,
        amount: p.amount,
        mode: p.mode,
      })),
  },
  imaging: {
    label: "Imaging",
    build: async () =>
      (
        await prisma.imagingStudy.findMany({
          include: { patient: true, operator: true, order: { include: { orderedBy: true } } },
          orderBy: { studyDate: "desc" },
        })
      ).map((s) => ({
        id: s.id,
        date: day(s.studyDate),
        patient: s.patient.name,
        bodyPart: s.bodyPart,
        view: s.view ?? "",
        side: s.side ?? "",
        reportStatus: s.reportStatus,
        machine: s.machineModel ?? "",
        kvp: s.kvp ?? "",
        mas: s.mas ?? "",
        operator: s.operator?.name ?? "",
        referredBy: s.order?.orderedBy?.name ?? "",
      })),
  },
  physio: {
    label: "Physio",
    build: async () =>
      (await prisma.physioPackage.findMany({ include: { patient: true }, orderBy: { purchaseDate: "desc" } })).map((pk) => ({
        id: pk.id,
        patient: pk.patient.name,
        name: pk.name,
        totalSessions: pk.totalSessions,
        sessionsUsed: pk.sessionsUsed,
        price: pk.price,
        status: pk.status,
        purchaseDate: day(pk.purchaseDate),
        expiryDate: day(pk.expiryDate),
      })),
  },
};

// Full JSON backup of every record type. Image blobs (data URLs) are omitted to keep
// the file lean — a `hasImage` flag is kept instead (object storage is a separate item).
export async function getFullBackup() {
  const [
    clinic,
    staff,
    patients,
    appointments,
    visits,
    prescriptions,
    imagingOrders,
    imagingStudies,
    physioPackages,
    physioSessions,
    physioAssessments,
    invoices,
    payments,
    messages,
    referrals,
  ] = await Promise.all([
    prisma.clinic.findFirst(),
    prisma.staff.findMany(),
    prisma.patient.findMany(),
    prisma.appointment.findMany(),
    prisma.visit.findMany(),
    prisma.prescription.findMany({ include: { lines: true } }),
    prisma.imagingOrder.findMany(),
    prisma.imagingStudy.findMany(),
    prisma.physioPackage.findMany(),
    prisma.physioSession.findMany(),
    prisma.physioAssessment.findMany({ include: { rom: true } }),
    prisma.invoice.findMany({ include: { lines: true, payments: true } }),
    prisma.payment.findMany(),
    prisma.message.findMany(),
    prisma.referral.findMany(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    clinic,
    staff,
    patients,
    appointments,
    visits,
    prescriptions,
    imagingOrders,
    imagingStudies: imagingStudies.map(({ imagePath, ...s }) => ({ ...s, hasImage: !!imagePath })),
    physioPackages,
    physioSessions,
    physioAssessments,
    invoices,
    payments,
    messages,
    referrals,
  };
}
