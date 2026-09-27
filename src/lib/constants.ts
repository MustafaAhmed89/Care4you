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

// F-23 — demo logins shown as one-click quick-fill on /login (demo mode only).
// A real clinic sets NEXT_PUBLIC_DEMO_MODE="false" to hide this panel and manages
// its own staff accounts. All demo accounts share DEMO_PASSWORD (seeded, hashed).
export const DEMO_PASSWORD = "orthocare";
export const DEMO_LOGINS: { role: string; label: string; email: string }[] = [
  { role: "OWNER_DOCTOR", label: "Owner / Doctor", email: "owner@care4you.demo" },
  { role: "FRONT_DESK", label: "Front Desk", email: "frontdesk@care4you.demo" },
  { role: "PHYSIO", label: "Physiotherapist", email: "physio@care4you.demo" },
  { role: "PHARMACIST", label: "Pharmacist", email: "pharmacist@care4you.demo" },
  { role: "ADMIN", label: "Admin", email: "admin@care4you.demo" },
];

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

// Referral letters (F-08)
export const REFERRAL_URGENCY_LABELS: Record<string, string> = {
  ROUTINE: "Routine",
  URGENT: "Urgent",
};

// Patient self-service response to a reschedule/cancel link (F-03)
export const PATIENT_RESPONSE_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmed by patient",
  RESCHEDULE: "Reschedule requested",
  CANCELLED: "Cancelled by patient",
};

// Common onward-referral targets for an ortho + physio clinic (form suggestions).
export const REFERRAL_SPECIALTIES = [
  "Spine Surgery",
  "Joint Replacement / Arthroplasty",
  "Sports Medicine",
  "Rheumatology",
  "Neurology",
  "Neurosurgery",
  "Pain Management",
  "Endocrinology (Osteoporosis / Diabetes)",
  "General Surgery",
  "MRI Scan",
  "CT Scan",
  "DEXA (Bone Densitometry)",
  "Nerve Conduction Study / EMG",
  "Physiotherapy (external)",
  "Higher Centre / Hospital Admission",
] as const;

// Imaging orders + AERB / exposure register (F-09 / F-12)
export const IMAGING_ORDER_STATUS_LABELS: Record<string, string> = {
  ORDERED: "Ordered",
  CAPTURED: "Captured",
  CANCELLED: "Cancelled",
};

// Common X-ray regions and projections (form suggestions).
export const XRAY_REGIONS = [
  "Right Knee", "Left Knee", "Right Shoulder", "Left Shoulder",
  "Cervical Spine", "Lumbar Spine", "Right Wrist", "Left Wrist",
  "Right Ankle", "Left Ankle", "Right Hip", "Left Hip",
  "Right Hand", "Left Hand", "Right Foot", "Left Foot", "Chest", "Pelvis",
] as const;

export const XRAY_VIEWS = ["AP", "Lateral", "AP + Lateral", "Oblique", "Skyline", "PA", "Weight-bearing"] as const;

export const XRAY_SIDES: { value: string; label: string }[] = [
  { value: "NA", label: "N/A" },
  { value: "LEFT", label: "Left" },
  { value: "RIGHT", label: "Right" },
];

// Home Exercise Program library (F-17) — a simple starter set the therapist picks from.
export type LibraryExercise = { name: string; instructions: string; sets: string; reps: string; frequency: string };
export const EXERCISE_LIBRARY: LibraryExercise[] = [
  { name: "Quadriceps sets (static)", instructions: "Tighten the thigh, push the knee down into the bed, hold, relax.", sets: "3", reps: "10 (hold 5s)", frequency: "2x/day" },
  { name: "Straight leg raise", instructions: "Keep the knee straight, lift the leg ~30 cm, hold, lower slowly.", sets: "3", reps: "10", frequency: "Daily" },
  { name: "Heel slides", instructions: "Slide the heel towards the buttock to bend the knee, then straighten.", sets: "3", reps: "10", frequency: "2x/day" },
  { name: "Hamstring stretch", instructions: "Sit with the leg straight, reach for the toes, feel the stretch behind the thigh.", sets: "3", reps: "hold 20s", frequency: "Daily" },
  { name: "Wall squats", instructions: "Back against a wall, slide down to a shallow squat, hold, rise.", sets: "3", reps: "hold 10s", frequency: "Daily" },
  { name: "Calf raises", instructions: "Rise onto the toes, hold, lower slowly. Use support for balance.", sets: "3", reps: "12", frequency: "Daily" },
  { name: "Shoulder pendulum", instructions: "Lean forward, let the arm hang, swing gently in small circles.", sets: "2", reps: "10 each way", frequency: "2x/day" },
  { name: "Scapular squeeze", instructions: "Squeeze the shoulder blades together, hold, relax.", sets: "3", reps: "10 (hold 5s)", frequency: "Daily" },
  { name: "Neck isometrics", instructions: "Press the head gently into your hand without moving. Hold.", sets: "3", reps: "hold 5s each side", frequency: "Daily" },
  { name: "Lumbar extension (prone)", instructions: "Lie face down, prop on the elbows, ease into a gentle back extension.", sets: "3", reps: "hold 10s", frequency: "2x/day" },
  { name: "Pelvic tilts", instructions: "Flatten the low back into the floor by tilting the pelvis, hold.", sets: "3", reps: "10", frequency: "Daily" },
  { name: "Ankle pumps", instructions: "Move the foot up and down at the ankle to keep circulation.", sets: "3", reps: "15", frequency: "3x/day" },
  { name: "Wrist flexor stretch", instructions: "Extend the arm, gently pull the fingers back with the other hand.", sets: "3", reps: "hold 20s", frequency: "Daily" },
];

// ── RBAC (F-23 PR-B) ──────────────────────────────────────────────────────
// Single source of truth for role-based access. `RESOURCE_ROLES` drives BOTH the
// sidebar menus and the server-side PAGE guards (see requireResource). Server
// actions are gated separately by `ACTION_ROLES`, because viewing a page ≠ doing
// its mutations (e.g. a physio sees the queue but can't register a walk-in).
const R = ROLES;
export const ALL_ROLES: string[] = [R.OWNER_DOCTOR, R.FRONT_DESK, R.PHYSIO, R.PHARMACIST, R.ADMIN];

// Nav keys appear in the sidebar; the extra resource keys (visit/hep/referral/rx)
// are detail/print pages with no menu item but still role-guarded.
export type NavKey =
  | "queue"
  | "patients"
  | "physio"
  | "imaging"
  | "billing"
  | "messages"
  | "reports"
  | "settings";
export type ResourceKey = NavKey | "visit" | "hep" | "referral" | "rx";

export const RESOURCE_ROLES: Record<ResourceKey, string[]> = {
  queue: [R.OWNER_DOCTOR, R.FRONT_DESK, R.PHYSIO, R.ADMIN],
  patients: ALL_ROLES,
  visit: [R.OWNER_DOCTOR, R.ADMIN],
  physio: [R.OWNER_DOCTOR, R.PHYSIO, R.ADMIN],
  hep: [R.OWNER_DOCTOR, R.PHYSIO, R.ADMIN],
  referral: [R.OWNER_DOCTOR, R.ADMIN],
  imaging: [R.OWNER_DOCTOR, R.FRONT_DESK, R.ADMIN],
  billing: [R.OWNER_DOCTOR, R.FRONT_DESK, R.PHARMACIST, R.ADMIN],
  rx: [R.OWNER_DOCTOR, R.ADMIN],
  messages: [R.OWNER_DOCTOR, R.FRONT_DESK, R.ADMIN],
  reports: [R.OWNER_DOCTOR, R.ADMIN],
  settings: [R.OWNER_DOCTOR, R.ADMIN],
};

export function roleCan(role: string, resource: ResourceKey): boolean {
  return (RESOURCE_ROLES[resource] ?? []).includes(role);
}

// Server action → allowed roles. `respondToAppointment` is intentionally absent —
// it is the public, login-free patient link (/appt/[id]) and must stay open.
export const ACTION_ROLES = {
  registerWalkIn: [R.OWNER_DOCTOR, R.FRONT_DESK, R.ADMIN],
  updateApptStatus: [R.OWNER_DOCTOR, R.FRONT_DESK, R.PHYSIO, R.ADMIN],
  createVisit: [R.OWNER_DOCTOR, R.ADMIN],
  createInvoice: [R.OWNER_DOCTOR, R.FRONT_DESK, R.PHARMACIST, R.ADMIN],
  addPayment: [R.OWNER_DOCTOR, R.FRONT_DESK, R.PHARMACIST, R.ADMIN],
  recordPhysioSession: [R.OWNER_DOCTOR, R.PHYSIO, R.ADMIN],
  createPhysioPackage: [R.OWNER_DOCTOR, R.PHYSIO, R.ADMIN],
  createAssessment: [R.OWNER_DOCTOR, R.PHYSIO, R.ADMIN],
  createHep: [R.OWNER_DOCTOR, R.PHYSIO, R.ADMIN],
  shareHep: [R.OWNER_DOCTOR, R.PHYSIO, R.ADMIN],
  createReferral: [R.OWNER_DOCTOR, R.ADMIN],
  uploadStudy: [R.OWNER_DOCTOR, R.FRONT_DESK, R.ADMIN],
  shareStudy: [R.OWNER_DOCTOR, R.FRONT_DESK, R.ADMIN],
  createImagingOrder: [R.OWNER_DOCTOR, R.ADMIN],
  cancelImagingOrder: [R.OWNER_DOCTOR, R.ADMIN],
  captureImagingStudy: [R.OWNER_DOCTOR, R.FRONT_DESK, R.ADMIN],
  sendMessage: [R.OWNER_DOCTOR, R.FRONT_DESK, R.ADMIN],
  markRequestHandled: [R.OWNER_DOCTOR, R.FRONT_DESK, R.ADMIN],
  updateClinic: [R.OWNER_DOCTOR, R.ADMIN],
} satisfies Record<string, string[]>;

const NAV_KEYS: NavKey[] = ["queue", "patients", "physio", "imaging", "billing", "messages", "reports", "settings"];

// Derived from RESOURCE_ROLES so the sidebar and the page guards can never drift.
export const ROLE_NAV: Record<string, NavKey[]> = Object.fromEntries(
  ALL_ROLES.map((role) => [role, NAV_KEYS.filter((k) => RESOURCE_ROLES[k].includes(role))]),
);
