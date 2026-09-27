# F-23 — Real Authentication & RBAC — Implementation Plan

> **Status: DRAFT** · Author: Mustafa Ahmed · 2026-09-27
> Scope: replace the demo role-switcher with real login + enforced role-based access
> control, so OrthoCare can hold real patient data. Prerequisite for F-24 (DPDP
> consent/audit). Estimate: **~3–5 assisted build-days (~1 week part-time)**, **~₹0 software cost**.

---

## 0. Decisions needed from you (before build)

The rest of the plan assumes the **recommended** column. Tell me if you want to change any.

| # | Decision | Options | Recommended | Why |
|---|----------|---------|-------------|-----|
| D1 | **Login method** | email+password · magic-link · phone OTP | **email + password** | Simplest, no per-message cost, works offline-ish, staff already have emails/phones. |
| D2 | **Auth library** | Auth.js (NextAuth v5) · Better Auth · Clerk/Neon Auth (managed) | **Auth.js Credentials** | Reuses our existing `Staff` table as the user, JWT session = no new tables, $0. See §4. |
| D3 | **Tenancy** | single-clinic now · full multi-tenant | **single-clinic now** | We sell to one owner-run clinic at a time; multi-tenant doubles the work. Deferred, tracked. |
| D4 | **Staff invites** | admin sets a temp password · emailed invite/reset links | **admin sets temp password** | Keeps cost at ₹0 (no email service). Add emailed resets later when a domain/email service exists. |
| D5 | **Keep a demo login?** | yes (read-friendly owner account) · no | **yes** | So sales demos still work post-auth. A seeded `owner@care4you.demo` with a known demo password. |

If you'd rather have emailed password resets and 2FA out-of-the-box, we switch D2→**Better Auth** and D4→emailed invites (adds an email service, still free tier — see the cost note in §9).

---

## 1. Objective & acceptance criteria

**Objective:** every staff user logs in with real credentials; the app enforces *what each
role can see and do* on the server (not just by hiding menus); the owner can manage staff
accounts. Public patient links keep working without login.

**PRD F-23 acceptance** (from `OrthoCare-Clinic-MVP-Requirements.md` §9):
- [ ] Roles: owner_doctor / front_desk / physiotherapist / pharmacist / admin ✅ (already modelled)
- [ ] Menus **and data** scoped by role — *enforced server-side*, not just sidebar filtering
- [ ] Users can be set active / inactive (inactive = cannot log in)
- [ ] All scoped by clinic — **deferred** (single-clinic MVP; tracked as follow-on, see §11)

**Definition of done:** an unauthenticated request to any staff route redirects to `/login`;
a logged-in user hitting a route/action outside their role gets blocked (403 / redirect),
verified for all five roles; `/appt/[id]` still works with no login; demo login works.

---

## 2. Current state — what we're replacing

| Piece | Today | File |
|-------|-------|------|
| "Auth" | Plaintext cookie `oc_role`, defaults to `OWNER_DOCTOR`; **anyone can switch role** via the top bar | `src/lib/session.ts`, `setRole` in `src/app/actions.ts` |
| Menu scoping | `ROLE_NAV` filters the sidebar/mobile nav only | `src/lib/constants.ts`, `Sidebar.tsx`, `MobileNav.tsx` |
| URL protection | **None** — direct URLs are not blocked (JOURNAL §6) | — |
| Action protection | **None**, except `/api/export` which checks the role cookie | `src/app/api/export/route.ts` |
| Staff model | `id, name, role, nmcRegNo, phone, active, isProvider` — **no email, no password** | `prisma/schema.prisma` |
| Public patient page | `/appt/[id]` rendered "bare" (no shell) for reschedule/cancel | `middleware.ts`, `layout.tsx` |

**Confirmed:** the WhatsApp `REPORT_SHARE` message contains **no link** (just "your report is
ready, keep it for your records"), so `/hep/[id]`, `/rx/[id]`, `/receipt/[id]`, `/referral/[id]`
are **staff-only** print pages. Only `/appt/[id]` is patient-facing. (Verified in
`messaging.ts` `buildBody` + `actions.ts` share functions.)

---

## 3. Target architecture (recommended)

```
Browser ──login form──► /login ──► Auth.js Credentials.authorize()
                                        │  look up Staff by email
                                        │  verify bcrypt(passwordHash)
                                        │  reject if !active
                                        ▼
                              JWT session cookie {staffId, role, name}
                                        │
       ┌────────────────────────────────┼───────────────────────────────┐
       ▼                                 ▼                                ▼
  middleware.ts                   requireRole() in                 getCurrentUser()
  (has session?                   layouts / pages /                replaces
   else → /login,                 server actions                  getCurrentRole()
   allowlist public)              (Node runtime)                  (reads session)
```

- **Staff IS the user.** No separate user table — we add auth fields to `Staff` and Auth.js
  reads it in `authorize()`. Session uses the **JWT strategy**, so no DB `Session`/`Account`
  tables are needed. Minimal surface, reuses everything we have.
- **Password hashing:** `bcryptjs` (pure-JS — avoids native-module build issues on Vercel).
- **Runtime split (known Auth.js v5 gotcha):** `bcryptjs` needs the **Node** runtime, but
  middleware runs on the **edge**. So middleware only checks *session-cookie presence* and
  handles the public allowlist; **all role checks run server-side** in `requireRole()`
  (layouts/pages/actions are Node). This sidesteps the edge/bcrypt problem cleanly.
- **Single source of truth for RBAC:** promote `ROLE_NAV` into one `ROLE_RESOURCES` map that
  drives *both* the sidebar *and* the server-side route/action guards, so they can never drift.

**Fallback:** if we later want built-in emailed resets / email-verification / 2FA, swap to
**Better Auth** (its own tables + an email service). The role-matrix and guard work below is
identical either way — only the login/session plumbing changes.

---

## 4. Data model changes (additive `prisma db push`)

```prisma
model Staff {
  // ... existing fields ...
  email        String?  @unique   // login identity (nullable until a staff row is given creds)
  passwordHash String?            // bcrypt; null = not yet set / invited
  lastLoginAt  DateTime?          // optional, nice for the owner + future audit
}
```

- Additive only → plain `prisma db push` on the shared Neon `production` branch (no reset, no
  data loss). Matches the project's additive-migration rule.
- **Seed** (`src/lib/seed.ts`): give the 5 demo staff real emails + a hashed demo password so
  the demo keeps working; keep one obvious `owner@care4you.demo` (D5). Password stored hashed;
  the plaintext demo password goes in `.env.example` / seed comment, **not** in chat or the repo history.
- No new tables (JWT session strategy). If we pick Better Auth instead, it adds
  `user/session/account/verification` tables — still additive.

---

## 5. Authorization design — the core work

### 5.1 Route allowlist (public, no login)
Everything requires login **except**:
- `/login` (and its POST)
- `/appt/[id]` — patient reschedule/cancel (F-03)
- `/api/whatsapp/webhook` — Meta verifies via its own `hub.verify_token` / signature
- `/api/reseed` — already gated by `Bearer $CRON_SECRET`
- `_next/*`, static assets, `favicon.ico`, `samples`

Fail **closed**: middleware blocks anything not on the allowlist and not authenticated.

### 5.2 Role → capability matrix (server-enforced)

Roles: **OWN**=owner_doctor · **FD**=front_desk · **PHY**=physio · **PHA**=pharmacist · **ADM**=admin.
(Starting point — tune any cell; this becomes the `ROLE_RESOURCES` map.)

**Pages**

| Route | OWN | FD | PHY | PHA | ADM | Notes |
|-------|:--:|:--:|:--:|:--:|:--:|-------|
| `/` (queue) | ✅ | ✅ | ✅ | — | ✅ | |
| `/patients`, `/patients/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | |
| `/patients/[id]/visit` | ✅ | — | — | — | ✅ | doctor encounter |
| `/physio`, `/patients/[id]/physio` | ✅ | — | ✅ | — | ✅ | |
| `/patients/[id]/hep`, `/hep/[id]` | ✅ | — | ✅ | — | ✅ | |
| `/patients/[id]/refer`, `/referral/[id]` | ✅ | — | — | — | ✅ | |
| `/imaging`, `/imaging/register` | ✅ | ✅ | — | — | ✅ | FD operates the X-ray |
| `/billing`, `/receipt/[id]` | ✅ | ✅ | — | ✅ | ✅ | |
| `/rx/[id]` | ✅ | — | — | — | ✅ | prescription print |
| `/messages` | ✅ | ✅ | — | — | ✅ | |
| `/reports` | ✅ | — | — | — | ✅ | owner dashboard |
| `/settings` | ✅ | — | — | — | ✅ | incl. staff mgmt + export |
| `/appt/[id]` | 🌐 public | | | | | patient link |

**Server actions** (all 21 in `src/app/actions.ts`)

| Action | Allowed roles |
|--------|---------------|
| `registerWalkIn`, `updateApptStatus`, `markRequestHandled`, `sendMessage` | OWN, FD, ADM (+PHY for `updateApptStatus` check-in) |
| `createVisit` | OWN, ADM |
| `createInvoice`, `addPayment` | OWN, FD, ADM, PHA |
| `recordPhysioSession`, `createPhysioPackage`, `createAssessment`, `createHep`, `shareHep` | OWN, PHY, ADM |
| `createReferral` | OWN, ADM |
| `createImagingOrder`, `cancelImagingOrder`, `uploadStudy`, `shareStudy`, `captureImagingStudy` | OWN, ADM, FD |
| `updateClinic` | OWN, ADM |
| `respondToAppointment` | 🌐 **public** — must stay unauthenticated |
| `setRole` | **remove** (or keep behind a `NODE_ENV!=production` dev flag) |

**API routes:** `/api/export` → OWN, ADM (switch from cookie to real session) · `/api/reseed`
→ cron secret (unchanged) · `/api/whatsapp/webhook` → Meta verify token (unchanged).

### 5.3 Enforcement helpers (new, in `src/lib/session.ts`)
- `getCurrentUser()` → `{ staffId, role, name } | null` from the session (replaces `getCurrentRole()`).
- `requireUser()` → redirects to `/login` if not authed; returns the user.
- `requireRole(...roles)` → 403/redirect if the user's role isn't allowed; call at the top of
  every guarded page (server component) **and** every mutating server action / route handler.

---

## 6. UI changes
- **`/login`** page — email + password, error states, redirect back to intended URL.
- **Top bar** — replace the "Viewing as" role switcher with the logged-in user's name + role
  and a **Log out** button.
- **`/settings` → Staff accounts** (OWN/ADM only): list staff; add staff (name, role, email,
  temp password); edit role; **activate / deactivate**; reset password. Uses existing `active` flag.
- Sidebar/MobileNav: unchanged behaviour, but sourced from the unified `ROLE_RESOURCES` map.

---

## 7. Security checklist
- Session cookie: `httpOnly`, `Secure`, `SameSite=Lax`; strong `AUTH_SECRET` (Vercel env).
- Passwords: `bcryptjs` hash (cost ≥ 10); never logged, never returned to the client.
- Fail-closed middleware; explicit public allowlist; inactive staff cannot log in.
- Basic login rate-limit / lockout (light — in-memory or a small counter; note Vercel is stateless).
- No secrets client-side; `/api/export` and all mutations re-check role on the server.
- **DPDP tie-in (F-24):** real `staffId` on the session is the foundation for the access/change
  audit log; role-based data access is the DPDP access-control requirement.
- Note (out of scope, flag): `/appt/[id]` uses the appointment `cuid` as the token — fine for
  MVP; consider a dedicated unguessable token when we harden F-24.

---

## 8. Work breakdown & PR sequencing

Three reviewable PRs (each its own worktree + preview URL), smallest-blast-radius first:

**PR-A — Auth core (login works, role read from session)** · ~1.5 d
- Add `email`/`passwordHash`/`lastLoginAt` to `Staff`; `db push`; seed real creds.
- Install Auth.js + `bcryptjs`; `authorize()` against `Staff`; JWT session.
- `/login` + logout; `getCurrentUser()`/`requireUser()`; middleware presence-check + public allowlist.
- Swap `layout.tsx` + `/api/export` from `getCurrentRole()` to the session.
- *After PR-A: app requires login; existing sidebar scoping still works.*

**PR-B — Authorization pass (the security boundary)** · ~1.5–2 d
- `ROLE_RESOURCES` single source of truth; `requireRole()` on every page + every action + `/api/export`.
- Keep `respondToAppointment` / `/appt/*` public; remove `setRole`.
- Cross-role test pass (all 5 roles × guarded routes/actions + public link).

**PR-C — Staff account management** · ~0.5–1 d
- `/settings` staff CRUD: add/invite, edit role, activate/deactivate, reset password.
- Remove the "Viewing as" switcher from the top bar; show user + logout.

Docs updated in the same PRs (JOURNAL session log + backlog; DEMO.md use case + status), per `CLAUDE.md`.

**Total: ~3.5–5 build-days → ~1–1.5 weeks part-time** with your review/merge between PRs.

---

## 9. What you provide + costs

**You provide:** decisions D1–D5 · the first owner account (email + temp password) · Vercel env
`AUTH_SECRET` (I'll tell you the exact value/how to generate) · your review/merge time.
*Only if you pick emailed invites/resets later:* an email service (Resend/Postmark free tier)
+ a domain with DNS.

| Item | Choice | Cost |
|------|--------|------|
| Auth.js + bcryptjs | open source, self-hosted | **₹0** |
| Neon (2 columns) | current free tier | **₹0** |
| Vercel | unchanged by auth | ₹0 (Hobby is non-commercial; **Pro ~$20/mo when you start selling** — a go-to-market cost, not an auth cost) |
| Email service | not needed with D4=temp passwords | **₹0** (free tier later if we add resets) |
| Custom domain | optional | ~₹1,000/yr |

**Net: software ≈ ₹0.** The real cost is time.

---

## 10. Risks & mitigations
- **Missing a guard** on some action/route → security hole. *Mitigation:* single `ROLE_RESOURCES`
  map + a checklist test across all 5 roles; PR-B is dedicated to exactly this.
- **Blocking a public route** by accident (patients can't reschedule) → *explicit allowlist + a test hitting `/appt/[id]` logged-out*.
- **Edge/bcrypt runtime clash** → keep role checks in Node (server components/actions), middleware stays light. (§3)
- **Shared Neon across worktrees** → additive `db push` only; coordinate any reseed.
- **Locked-out owner** → seed a known demo/owner account; document the reset path.

---

## 11. Out of scope (follow-ons)
- **Multi-tenant clinic scoping** (D3) — `clinicId` on every model + query scoping + clinic onboarding. Do when onboarding >1 clinic.
- **F-24 DPDP consent + audit log** — next after this; depends on real identity.
- Emailed invites/resets, 2FA, SSO, phone-OTP login.
- Object storage for X-rays (unrelated productionization item).

---

## 12. Open questions for you
1. Confirm D1–D5 (or edit).
2. Is the §5.2 role matrix right for how the clinic actually works? (e.g. should **front desk**
   capture X-rays / take payments? should **physio** check patients in?) — easiest thing to get wrong, easiest to change.
3. Any staff who need **two** roles (e.g. owner who also does physio)? Current model is one role
   per user; multi-role is a small extension if you need it.
```
