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
