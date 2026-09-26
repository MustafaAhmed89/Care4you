# OrthoCare — Clinic Management MVP (Demo)

A dead-simple, WhatsApp-first clinic operating system for small owner-run ortho + physiotherapy clinics in Bengaluru. Built from [`OrthoCare-Clinic-MVP-Requirements.md`](OrthoCare-Clinic-MVP-Requirements.md) — the **Demoable Core Cut (§8.3)** on a modern web stack.

> **Status:** demo build v0.1. Pre-loaded with a realistic clinic day so you can host it and pitch to clinics.

---

## What's inside (mapped to the requirements)

| Demo-core area | Requirement | Where |
|---|---|---|
| Walk-in token **queue** + booking | F-01 / F-02 | `/` (Queue · Today) |
| **WhatsApp** confirmations & reminders | F-21 | `/messages` + throughout |
| Patient **search + records** + **prescription** (generic + NMC no.) | F-04 / F-07 | `/patients`, `/patients/[id]`, `/rx/[id]` |
| **Billing** + **day-end reconciliation** + dues | F-18 / F-19 / F-20 | `/billing` |
| **Physio** packages: auto-decrement + renewal alerts | F-15 / F-16 | `/physio` |
| **X-ray** phone-photo capture + WhatsApp share | F-10 / F-11 / F-12 | `/imaging`, patient profile |
| Owner **dashboard** | F-22 | `/reports` |
| Role-based access (demo) | F-23 | "Viewing as" switcher (top-right) |
| Clinic identity / GST / AERB / pharmacy toggle | F-27 / §13 | `/settings` |
| Print-to-PDF prescription & GST-aware receipt | F-07 / F-18 | `/rx/[id]`, `/receipt/[id]` |

## Tech stack

- **Next.js 14** (App Router, TypeScript, Server Actions)
- **Prisma** ORM + **PostgreSQL** (Neon / Supabase / Vercel Postgres)
- **Tailwind CSS** — mobile/tablet-first

---

## Quick start (local)

This build uses **PostgreSQL**. Create a free DB at [neon.tech](https://neon.tech), copy its pooled + direct URLs into `.env` (template in `.env.example`), then:

```bash
npm install
npm run setup   # creates tables + loads demo data (needs DATABASE_URL / DIRECT_URL)
npm run dev     # http://localhost:3000
```

Open http://localhost:3000 — you'll land on today's queue. **Reset demo data anytime** (before a pitch) with `npm run reset`.

**Deploying a public demo URL?** → see **[DEPLOY.md](DEPLOY.md)** (Vercel + Neon, ~10 min).

> Prefer zero-config offline local dev? In `prisma/schema.prisma` set `provider = "sqlite"`, remove the `directUrl` line, set `DATABASE_URL="file:./dev.db"`, then `npm run setup`.

### Roles (demo "login")
Use the **"Viewing as"** dropdown (top-right) to switch between Owner/Doctor, Front Desk, Physiotherapist, Pharmacist. The sidebar adapts to the role. (Real auth replaces this in production.)

---

## The 2-minute demo flow (from requirements §20)

1. **Queue** — show the live token queue; click **Register walk-in** → new patient gets a token instantly.
2. **WhatsApp** — on the queue, hit **Remind** on a booked patient (or `/messages` → Send) → the exact reminder appears in the outbox.
3. **3-second history** — Patients → search a name → full history + last X-ray open instantly.
4. **X-ray** — on a patient, **Add X-ray** (snap/upload) → **Share** → goes to the WhatsApp outbox.
5. **Prescription** — New visit → add drugs (generic-first) → **Print Rx** (letterhead + NMC number).
6. **Physio** — `/physio` → a package auto-decrements and a **renewal-due** alert fires ("money walking out").
7. **Day-end** — `/billing` → one-click collections by Cash/UPI/Card, reconciled to the drawer.

---

## Make it *their* clinic before a demo

Go to **Settings** and set the clinic name, tagline, address, doctor name + NMC number, logo initials, GST/AERB details. These flow straight onto the header, prescriptions, and receipts — so the demo mirrors the clinic you're pitching. (Or edit the defaults in `prisma/seed.mjs` and re-run `npm run reset`.)

---

## Going live with WhatsApp (real sends)

The demo generates **real utility-template message text** and simulates delivery via a mock provider (`src/lib/messaging.ts`). To send for real (see requirements §14):

1. Sign up with an India **BSP** (AiSensy / Interakt / Wati / Gupshup) and verify a WhatsApp number.
2. Get 3–4 **utility** templates approved (booking confirm, 24h reminder, 2h reminder, report share).
3. Implement `BspProvider.send()` in `src/lib/messaging.ts` against the BSP's API.
4. Set `MESSAGING_PROVIDER=bsp` in the environment.

Opt-in is captured per patient (`whatsappOptIn`); non-opted-in patients are skipped (SMS fallback is a TODO).

---

## Hosting

**Public demo on Vercel + Neon Postgres** — follow **[DEPLOY.md](DEPLOY.md)** (~10 min, free tier). X-ray images are stored as data URLs, so no object storage is needed for the demo.

---

## Project structure

```
prisma/schema.prisma      # data model (SQLite; Postgres-ready)
prisma/seed.mjs           # demo clinic + a realistic day of data
src/app/                  # pages (queue, patients, billing, physio, imaging, messages, reports, settings)
src/app/actions.ts        # server actions (all mutations)
src/lib/                  # db client, messaging (BSP-pluggable), constants, formatting
src/components/           # UI + interactive client forms
```

---

## Known limitations (demo scope — intentional, per requirements)

- **WhatsApp is simulated** until a BSP is connected (§14).
- **Role access** filters the nav but does not hard-block direct URLs — production needs real auth + route guards.
- **Pharmacy** module (Schedule H/H1, inventory) is **deferred** (F-29/F-30) and off by default.
- **X-ray images** are stored as base64 data URLs in Postgres (fine for a demo — use Vercel Blob/S3 at scale).
- No offline mode yet (design tolerates a later add — §12).

See [`OrthoCare-Clinic-MVP-Requirements.md`](OrthoCare-Clinic-MVP-Requirements.md) for the full spec, phasing, regulatory notes, and open questions.
