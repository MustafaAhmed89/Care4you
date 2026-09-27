# OrthoCare — Project Journal

> Running log + handoff notes for the OrthoCare clinic-management MVP.
> **Last updated:** 2026-09-27 · **Maintainer:** Mustafa Ahmed

---

## 0. Resume here (quick start for next session)

**What this is:** a demoable clinic-management web app for small owner-run ortho + physiotherapy clinics in Bengaluru (archetypes: OrthoCure RT Nagar, Chaudhary/Chowdry Ortho). Built to host + demo to clinics as a sales tool.

**Live demo:** https://care4you.vercel.app/  ·  **Repo:** https://github.com/MustafaAhmed89/Care4you (`main` auto-deploys to Vercel on merge — **all changes now go via a feature branch + PR, never a direct push to `main`**; see [`CLAUDE.md`](CLAUDE.md))

**Run locally:**
```bash
cd D:\OrthoCare
npm install
npm run dev        # http://localhost:3000  (uses the Neon DB via .env)
npm run reset      # wipe + reload fresh demo data (targets Neon)
```

**Git workflow (important):** every fix/feature/enhancement goes on a **new branch → PR → merge to `main`** — never commit directly to `main`. Merging the PR is what deploys to production (Vercel auto-deploys `main`; each PR also gets its own preview URL). `.env` is gitignored (holds real Neon credentials) — never commit it. Full rule in [`CLAUDE.md`](CLAUDE.md).

**Demo freshness:** "today" views only show the **current IST day**. This is now **auto-handled by a daily reseed cron** (`/api/reseed` + `vercel.json`) — but it **requires the `CRON_SECRET` env var set in Vercel** (see §8 item 1). You can also refresh manually anytime with `npm run reset`.

**Top of the backlog (see §8):** (1) daily auto-reseed cron so the demo never goes stale, (2) real WhatsApp BSP, (3) Phase-2 clinical depth, (4) real auth before real patient data.

---

## 1. Current status

| Area | Status |
|---|---|
| Requirements / PRD | ✅ Done — `OrthoCare-Clinic-MVP-Requirements.md` (DRAFT v0.1, evidence-grounded) |
| MVP app (demoable core) | ✅ Built & verified — 8 modules, 30 features scoped, demo core working |
| Database | ✅ Neon Postgres (project *Care4you*, `production` branch), tables + demo data |
| Deployment | ✅ Live on Vercel, public URL, auto-deploy from GitHub `main` |
| WhatsApp | 🟡 Mock provider (real BSP not wired) |
| Auth | 🟡 Demo role-switcher only (no real login) |
| Pharmacy module | ⛔ Deferred (off by default) |

---

## 2. Tech stack & architecture

- **Next.js 14** (App Router, TypeScript, **Server Actions** for all mutations)
- **Prisma 5** ORM → **PostgreSQL** (Neon). SQLite was used for the very first local build, then migrated to Postgres for deploy.
- **Tailwind CSS** (mobile/tablet-first), **lucide-react** icons
- **date-fns** + **date-fns-tz** (clinic day computed in **Asia/Kolkata**, see §6)
- Messaging: pluggable provider interface (`src/lib/messaging.ts`) — mock by default, BSP slot for later
- No external services required to run beyond the Postgres URL.

**Rendering model:** every page is `export const dynamic = "force-dynamic"` (reads cookies + DB at request time). Mutations are server actions in `src/app/actions.ts`; forms post directly to them.

---

## 3. Infrastructure & accounts (no secrets here)

- **Neon** account: `vimtozedex@gmail.com` ("Vimto") — Mustafa's alternate email (NOT the SafePaaS email). Org `org-fragrant-cell-79985587`.
  - Project **Care4you** = `billowing-cake-48701577`, branch **production** (`br-still-thunder-b40rda8i`), region `aws-us-east-2`, DB `neondb`.
  - Neon CLI is `neon` (npm pkg `neon`; `neonctl` is a compat alias). `neon link` writes `.neon` + pulls creds into `.env`.
  - `neon.ts` = empty policy (`defineConfig({})`); `neon deploy` = no-op (Postgres only).
- **GitHub:** `MustafaAhmed89/Care4you`, default branch `main`. `gh` CLI authed as MustafaAhmed89.
- **Vercel:** team **MustafaPersonal** (Hobby). Project name must be lowercase (`care4you`). Env vars set: `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct). Auto-deploys on push to `main`.
- **Secrets:** live only in local `.env` (gitignored) and Vercel env settings. A broad Neon API key minted by `neon mcp` (id 3368080) was **revoked** — so the Neon MCP configs no longer authenticate (re-run `neon mcp` to restore if wanted).

---

## 4. What's built

**Modules / pages** (all under `src/app/`):
| Route | Purpose |
|---|---|
| `/` | Today's Queue — walk-in token queue + booking, per-status actions, day stats |
| `/patients`, `/patients/[id]` | Patient list/search + full profile (3-sec history) |
| `/patients/[id]/visit` | New visit + prescription (dynamic Rx lines) |
| `/rx/[id]` | Printable prescription (letterhead + NMC no.) |
| `/patients/[id]/refer` | Compose a referral letter (auto-prefilled from the latest visit) |
| `/referral/[id]` | Printable referral letter (clinic letterhead) |
| `/receipt/[invoiceId]` | Printable GST-aware receipt |
| `/billing` | Day-end reconciliation (cash/UPI/card) + dues + invoices |
| `/physio` | Session packages, renewal alerts, log session, sell package |
| `/imaging` | X-ray studies overview + share |
| `/messages` | WhatsApp outbox (chat-style previews) + compose |
| `/reports` | Owner dashboard (collections, no-show %, dues, revenue by line, 7-day chart) |
| `/settings` | Clinic identity, GST toggle, AERB, pharmacy toggle |

**Demoable Core Cut (built & verified):** queue+walk-in, patient search + printable Rx, billing + day-end, physio package auto-decrement + renewal alert, X-ray phone-photo upload + WhatsApp share, WhatsApp reminders (mock). Role switcher (demo RBAC), seeded demo data.

**Key files:**
- `prisma/schema.prisma` — data model (see PRD §11). `prisma/seed.mjs` — demo clinic + a realistic day.
- `src/app/actions.ts` — all server actions (mutations).
- `src/lib/` — `db.ts` (Prisma client), `messaging.ts` (WhatsApp provider), `constants.ts` (enum-like values), `format.ts` (IST formatting), `day.ts` (IST today-range), `session.ts` (cookie role).
- `src/components/` — UI primitives + client forms (NewVisitForm, NewInvoiceForm, UploadStudyForm, RegisterWalkInForm, NewAssessmentForm, NewReferralForm, RoleSwitcher, Sidebar, TopBar, MobileNav, PrintButton).

---

## 5. Key decisions & rationale

- **Walk-in / token queue is the daily backbone**, booking secondary — matches how these clinics actually run (from review research).
- **WhatsApp-first, no patient app** — patients live on WhatsApp; reminders/receipts/reports go there.
- **Mock WhatsApp provider** with a pluggable BSP interface — a real BSP (AiSensy/Interakt/…) needs Mustafa's Meta/BSP account; deferred but the seam exists.
- **X-ray images stored as base64 data URLs** in Postgres — serverless-safe (Vercel has no writable disk), zero object-storage account. Swap to Vercel Blob/S3 at scale.
- **Flat, transparent pricing** positioning (no per-appointment fee, no marketplace) — the wedge vs Practo.
- **Postgres over SQLite** for deploy; **Neon** for managed serverless Postgres + Vercel integration.
- **Clinic day forced to IST** in code (not server tz) — see §6.
- **Pharmacy deferred** behind an off-by-default toggle to keep the demo lean.

---

## 6. Gotchas already solved (don't re-break these)

- **Timezone:** Vercel runs in **UTC**. Originally date-filtered views (queue/day-end/reports) used `new Date().setHours(0,0,0,0)` (server-local) → empty on Vercel + wrong date header. **Fixed** by computing "today" and formatting dates in **Asia/Kolkata** (India has no DST) via `src/lib/day.ts` (`todayRange`) + `formatInTimeZone` in `format.ts`/`TopBar`. All 4 date-filtered pages import the shared `todayRange`. **Do not** reintroduce a local `setHours` today-range.
- **Prisma engine lock on Windows:** if `prisma generate` / `npm run build` fails with `EPERM … query_engine-windows.dll.node`, a dev server is running and holding the DLL — stop it first (`preview_stop` / kill the `next dev` process).
- **Prisma + SQLite has no enums** — enum-like fields are Strings; allowed values live in `src/lib/constants.ts`. (Kept as Strings on Postgres too for portability.)
- **Neon env var names:** `neon link` writes `DATABASE_URL` (pooled) + `DATABASE_URL_UNPOOLED` (direct). Prisma `directUrl = env("DATABASE_URL_UNPOOLED")`. (An earlier `DIRECT_URL` placeholder was removed.)
- **Vercel project name** must be lowercase.
- **Seed delete order:** `seedDemo()` wipes children before parents. Any new model with a required FK to `Patient`/`Staff`/`Visit` (Prisma's default `onDelete` is **Restrict**) **must** be added to the `deleteMany()` block at the top of `src/lib/seed.ts` — otherwise re-seeding (and the **daily reseed cron**) fails with a foreign-key RESTRICT error on `patient.deleteMany()`. `PhysioAssessment`/`PhysioRomEntry` and `Referral` are now handled (the assessment models were a latent miss fixed with F-08).

---

## 7. Known limitations (intentional demo scope)

- **WhatsApp is simulated** until a BSP is connected (`MESSAGING_PROVIDER=bsp` + implement `BspProvider.send()`).
- **Demo data freshness:** handled by the daily auto-reseed cron (§8 item 1) once `CRON_SECRET` is set in Vercel; otherwise "today" views go empty on later days until `npm run reset`.
- **Role access** filters the sidebar but does **not** hard-block direct URLs — needs real auth before real patient data.
- **Pharmacy** (Schedule H/H1, inventory) not built.
- **No offline mode** yet (design tolerates a later add).
- **X-ray images as data URLs** bloat the DB at scale — move to object storage for production.

---

## 8. Backlog / next steps (roughly prioritized)

1. ✅ **DONE — Daily auto-reseed.** `vercel.json` cron (`0 0 * * *` = 05:30 IST) → secret-guarded `/api/reseed` → `seedDemo()` (shared module `src/lib/seed.ts`, IST-correct). **Requires `CRON_SECRET` env var in Vercel** (else the route returns 503 and the cron no-ops). Manual trigger: `curl -H "Authorization: Bearer <CRON_SECRET>" https://care4you.vercel.app/api/reseed`. Hobby plan crons run ~once/day at approximate times — fine here.
2. 🟡 **Real WhatsApp — code DONE (Meta Cloud API).** `MetaCloudProvider` in `src/lib/messaging.ts` sends approved **template** messages; each message type → template name + ordered params via `buildMessage` (verified: CONFIRM/2H = 5 params, 24H = 4, REPORT/RECALL/DUES = 3). Mock stays the default. **To go live (user):** Meta Business + app, phone-number ID, permanent token, create the 6 Utility templates, set `MESSAGING_PROVIDER=meta` + `WHATSAPP_*` env in Vercel, redeploy — full guide in **`WHATSAPP.md`**. Caveat: seeded demo phone numbers are fake, so real sends to them fail — demo with a real opted-in number. Follow-ups: ✅ webhook route `/api/whatsapp/webhook` (Delivered/Read/Failed status) is built — set `WHATSAPP_VERIFY_TOKEN` + `WHATSAPP_APP_SECRET` in Vercel and subscribe the app to the `messages` field (WHATSAPP.md §4b). Remaining: host images + media template for real X-ray sharing.
3. **Vercel region → Mumbai (`bom1`)** via `vercel.json` for lower latency to India.
4. 🟡 **Phase-2 clinical depth** (PRD §9): ✅ **physio assessment + progress charts (F-13/F-14) DONE** (pain 0-10, ROM, LEFS/PSFS/ODI; trend charts at `/patients/[id]/physio`); ✅ **referral letter (F-08) DONE** (printable letterhead referral at `/referral/[id]`, composed at `/patients/[id]/refer`, auto-prefilled from the latest visit). Remaining: imaging order worklist + AERB register (F-09/F-12), HEP builder (F-17), reschedule link (F-03), data export/backup (F-26).
5. **Real authentication** (replace the demo role-switcher) — e.g. Neon Auth / Better Auth — before storing real patient data.
6. **Object storage for X-rays** (Vercel Blob / S3) instead of data URLs.
7. **Offline-tolerant mode** (a real buying criterion per research).
8. **Pharmacy module** (only if target clinics run one — validate first).
9. **DPDP hardening** (consent UI, audit surfacing) before production.

**Open questions to validate with real clinics** (from PRD §21): pricing/willingness-to-pay, Kannada/Hindi UI need, whether targets run a pharmacy, offline need, and confirm Chaudhary/Chowdry is still operating.

---

## 9. Related docs in this repo

- `OrthoCare-Clinic-MVP-Requirements.md` — the full PRD (personas, 18 pain points, 30 features, data model, regulatory, competitive, pricing, demo script). **Feed this back to extend features.**
- `README.md` — app overview + local run.
- `DEPLOY.md` — Neon + Vercel deploy runbook (mostly done now).
- `.env.example` — required env vars.

---

## 10. Session log

**2026-09-26 — Research & requirements**
- Ran multi-agent web research (patient reviews of OrthoCure/Chaudhary + peers, staff/owner ops, India regulatory [DPDP/AERB/GST/NMC/Schedule H1/KPME], competitors + pricing, clinical workflows).
- Backfilled failed research angles; synthesized personas + ranked pain points + prioritized features.
- Delivered `OrthoCare-Clinic-MVP-Requirements.md` (DRAFT v0.1).

**2026-09-27 — Build, deploy, fix**
- Built the MVP on Next.js + Prisma + Tailwind (SQLite locally first). Verified all demo-core flows in-browser.
- Converted to Postgres; made image upload serverless-safe (data URLs); git init + first commit.
- Set up Neon via CLI (installed `neon`, linked project *Care4you*/production, pulled creds, `neon deploy` no-op, installed Neon MCP + skills). Pushed schema + seeded Neon; verified app against Neon locally.
- Flagged & revoked the broad Neon API key (id 3368080).
- Pushed to GitHub `MustafaAhmed89/Care4you`; Mustafa imported to Vercel (`care4you`).
- **Diagnosed & fixed the UTC-vs-IST timezone bug** (empty today-views on Vercel); pushed → auto-redeployed.
- **Verified live:** https://care4you.vercel.app/ queue + billing working end-to-end with correct IST date and Neon data.

**2026-09-27 (cont.) — Daily auto-reseed cron**
- Extracted the seed into a shared, IST-correct module `src/lib/seed.ts` (`seedDemo(prisma)`); CLI now `tsx prisma/seed.ts` (added `tsx`); removed `prisma/seed.mjs`.
- Added secret-guarded `GET /api/reseed` (verifies `Bearer $CRON_SECRET`) + `vercel.json` cron (daily 05:30 IST).
- Verified locally: 401 without auth, `{ok:true, patients:14, appointments:11}` with the token.
- Set `CRON_SECRET` in Vercel (Production) + redeployed. **Verified in production:** `/api/reseed` returns 401 unauth (protected & active) — cron healthy. Gotcha confirmed: a Vercel env var only reaches deployments created *after* it's saved, so a fresh deploy was required.

**2026-09-27 (cont.) — Real WhatsApp (Meta Cloud API) integration**
- Reworked `src/lib/messaging.ts`: `buildMessage()` maps each type → WhatsApp template + ordered params; added `MetaCloudProvider` (POST graph.facebook.com/{PHONE_NUMBER_ID}/messages) + `normalizePhone`; mock remains default.
- Wired `actions.ts` send path to templates; message time now formatted in IST.
- Added `WHATSAPP.md` (Meta setup + the 6 templates to create + env vars + limits) and `.env.example` WhatsApp block.
- Verified template param mapping + build. NOT yet live — needs user's Meta account/templates/token + `MESSAGING_PROVIDER=meta` in Vercel.

**2026-09-27 (cont.) — WhatsApp status webhook + mobile nav fix**
- Added `GET/POST /api/whatsapp/webhook`: GET verification handshake; POST updates `Message.status` (SENT→DELIVERED→READ, or FAILED) matched by `providerId` (wamid), with `X-Hub-Signature-256` HMAC verification. Added `Message.providerId` column (pushed to Neon) + stored it on send. Verified locally: handshake echoes challenge / 403 on bad token; a `read` callback advanced a message to READ.
- **Fixed mobile navigation** (user-reported): the sidebar was `hidden md:flex` with no small-screen fallback, so phones had no nav. Extracted the nav list to `src/lib/nav.ts`; added `MobileNav.tsx` (hamburger + slide-in drawer, role-filtered) wired into `TopBar`. Verified on a 375px viewport: hamburger shows, drawer opens with all links. **Follow-up fix:** the drawer first rendered but was invisible — the header's `backdrop-blur` (backdrop-filter) makes it a containing block for `position:fixed`, clipping the drawer to the header strip. Fixed by portaling the overlay to `document.body` (`createPortal`) + body scroll lock; re-verified open & close on mobile. Gotcha for the future: don't put a `fixed` overlay inside an element that has `backdrop-filter`/`transform`/`filter`.

**2026-09-27 (cont.) — Physio assessments + progress charts (F-13/F-14)**
- Added `PhysioAssessment` + `PhysioRomEntry` models (pushed to Neon). `createAssessment` action; `NewAssessmentForm` (pain 0-10, functional scale LEFS/PSFS/ODI + score, ROM joint rows, therapist, note).
- New page `/patients/[id]/physio`: inline-SVG **Pain** and **Function** trend charts + assessment history table + form. Linked from patient profile and `/physio` package rows.
- Seeded 3 assessments for Deepa (pain 7→3, LEFS 30→58, knee ROM 90→125°) and 2 for Rajesh so the charts are populated in the demo. Verified locally: charts + history + form render.
- Note: added `autoPort:true` to `.claude/launch.json` (port 3000 was held by a stale server; local dev now falls back to a free port).

**2026-09-27 (cont.) — Mobile queue row layout fix + branch-workflow rule**
- **Fixed the Today's Queue rows on mobile** (`src/app/page.tsx`): each row was a single `flex flex-wrap` line, so the patient block (`min-w-0 flex-1`) shrank while badges/buttons held their width — name, phone and reason compressed into a thin column on phones. Rows now **stack below `sm`** (patient identity full-width on top; badges + actions wrap underneath) and revert to the original horizontal row at `sm+`. Verified at 375px and 1280px, both locally and on the live URL. (Distinct from the mobile-*nav* drawer fix above.)
- **Also cleared a corrupted `.next` dev cache** that was breaking local styling entirely (500s: `ENOENT .next\server`, `Cannot find module './379.js'`, `__webpack_modules__[moduleId] is not a function`; the `useContext` null errors were downstream symptoms). Fix: stop dev server → delete `.next` → restart. Pre-existing, not caused by the edit; `.next` is gitignored. Recurs if a build/dev process is killed mid-write — see §6 Prisma-lock gotcha.
- Shipped as commit `c7d2dce`, pushed **directly to `main`**.
- **New rule going forward (user-directed):** every fix/feature/enhancement goes on a **feature branch → PR → merge to `main`**, never a direct push to `main`. Documented in §0 and the new project [`CLAUDE.md`](CLAUDE.md).

**2026-09-27 (cont.) — Referral letter (F-08)**
- Added the `Referral` model (patient / referring provider / optional originating visit; refer-to name + facility, specialty, urgency, reason, clinical summary, current meds; pushed to Neon). `createReferral` server action → redirects to the print page.
- Compose at `/patients/[id]/refer` (`NewReferralForm`) **auto-prefills** reason / clinical-summary / current-meds from the patient's latest visit + prescription — the doctor mostly just fills the addressee. Printable letterhead letter at `/referral/[id]` (same `no-print`/`print-area` pattern as Rx & receipt; URGENT badge, addressee block, salutation, signature + reg no, footer).
- Profile integration: **Refer** button in the header, a per-visit **Refer** quick-action (carries `visitId` for prefill), and a **Referrals** card listing past letters with Print links.
- Seeded 2 referrals: Lakshmi → arthroplasty opinion (linked to her visit), Rajesh → **urgent** spine-surgery/MRI.
- **Fixed a latent seed bug** (see §6): `PhysioAssessment`/`PhysioRomEntry` were never in the seed's delete cascade, so re-seeding failed on `patient.deleteMany()` once assessments existed — this would also have broken the daily reseed cron. Added them (+ `Referral`) to the delete block; re-seed is now idempotent (ran twice cleanly).
- Verified locally end-to-end: profile Refer + Referrals card, prefill from visit, create → redirect → rendered letter, and the seeded urgent letter. Built clean (both new routes compile).
