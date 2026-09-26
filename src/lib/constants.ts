// Enum-like constants (SQLite has no native enums). Keep values in sync with schema.prisma.

export const ROLES = {
  OWNER_DOCTOR: "OWNER_DOCTOR",
  FRONT_DESK: "FRONT_DESK",
  PHYSIO: "PHYSIO",
  PHARMACIST: "PHARMACIST",
  ADMIN: "ADMIN",
} as const;
export type Role = keyof typeof ROLES;

export const ROLE_LABELS: Record<string, string> = {
  OWNER_DOCTOR: "Owner / Doctor",
  FRONT_DESK: "Front Desk",
  PHYSIO: "Physiotherapist",
  PHARMACIST: "Pharmacist",
  ADMIN: "Admin",
};

export const APPT_STATUS = {
  BOOKED: "BOOKED",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
  RESCHEDULED: "RESCHEDULED",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  BOOKED: "Booked",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Waiting",
  IN_PROGRESS: "In consult",
  COMPLETED: "Done",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
  RESCHEDULED: "Rescheduled",
};

// Tailwind badge classes per status
export const STATUS_BADGE: Record<string, string> = {
  BOOKED: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-brand-100 text-brand-800",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  NO_SHOW: "bg-red-100 text-red-700",
  RESCHEDULED: "bg-purple-100 text-purple-700",
};

export const SERVICE_TYPES = {
  CONSULT: "CONSULT",
  PHYSIO: "PHYSIO",
  XRAY: "XRAY",
  FOLLOWUP: "FOLLOWUP",
} as const;

export const SERVICE_LABELS: Record<string, string> = {
  CONSULT: "Consultation",
  PHYSIO: "Physiotherapy",
  XRAY: "X-ray",
  FOLLOWUP: "Follow-up",
};

export const SOURCE_LABELS: Record<string, string> = {
  PHONE: "Phone",
  WALK_IN: "Walk-in",
  WHATSAPP: "WhatsApp",
};

export const PAYMENT_MODES = ["CASH", "UPI", "CARD"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const ITEM_TYPES = ["CONSULT", "PROCEDURE", "PHYSIO", "XRAY", "PHARMACY", "OTHER"] as const;

export const MESSAGE_TYPE_LABELS: Record<string, string> = {
  CONFIRM: "Booking confirmation",
  REMINDER_24H: "24-hour reminder",
  REMINDER_2H: "2-hour reminder",
  REPORT_SHARE: "Report / X-ray shared",
  RECALL: "Follow-up recall",
  DUES: "Payment reminder",
};

export const SCHEDULE_FLAG_LABELS: Record<string, string> = {
  NONE: "",
  H: "Schedule H",
  H1: "Schedule H1",
};

// Which nav items each role sees (demo RBAC).
export type NavKey =
  | "queue"
  | "patients"
  | "physio"
  | "imaging"
  | "billing"
  | "messages"
  | "reports"
  | "settings";

export const ROLE_NAV: Record<string, NavKey[]> = {
  OWNER_DOCTOR: ["queue", "patients", "physio", "imaging", "billing", "messages", "reports", "settings"],
  FRONT_DESK: ["queue", "patients", "billing", "messages"],
  PHYSIO: ["queue", "patients", "physio"],
  PHARMACIST: ["patients", "billing"],
  ADMIN: ["queue", "patients", "physio", "imaging", "billing", "messages", "reports", "settings"],
};
