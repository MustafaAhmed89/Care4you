# OrthoCare — Demo Use-Case Catalog

> **Living document.** Every demoable use case, the exact click-path, and the sales talking point.
> **Keep this current:** whenever a feature is built or changed, add/refresh its use case here (same discipline as `JOURNAL.md`). See [§ Maintaining this doc](#maintaining-this-doc).
>
> **Status:** DRAFT · **Maintainer:** Mustafa Ahmed · **Last updated:** 2026-09-28

---

## How to run a demo

- **Live URL:** https://care4you.vercel.app/ — demo on the device the clinic owns (their phone/laptop).
- **Data is seeded and refreshed daily** (05:30 IST auto-reseed), so "today" always has a live queue. Refresh manually with `npm run reset` if needed.
- **Sign in per role:** the app now requires a login (F-23). On `/login`, click a **demo login** chip (Owner/Doctor, Front Desk, Physiotherapist, Pharmacist, Admin) to fill credentials, then **Sign in** — switch roles by logging out and back in (an owner "View as" quick-switch is coming in PR-C). Use this to show each person's view.
- **Pre-empt the two fears early:** *"your data is always yours"* (Use case 15) and *"it works when the internet drops"* (roadmap) — the two objections that kill small-clinic deals.

### Star demo data (who to open)
| Patient | Use for |
|---|---|
| **Deepa Shetty** | Physio: improving pain/function charts (7→3, LEFS 30→58) + a shared Home Exercise Program |
| **Rajesh Gupta** | **Urgent** spine-surgery referral letter; low-back physio |
| **Lakshmi Devi** | Knee OA: visit + Rx + X-ray (shared) + arthroplasty referral |
| **Fatima Begum** | Patient **rescheduled** via WhatsApp link (shows on the desk) |
| **Prakash Bhat** | Patient **cancelled** via WhatsApp link (freed slot) |
| **Suresh / Anita** | Open X-ray **orders** waiting in the technician worklist |

### Suggested 6-minute walkthrough
1. **Today's Queue** — the daily backbone (Use case 1) → point out the reschedule/cancel requests card (Use case 2).
2. Open **Deepa** → physio **progress charts** + **Home Exercise Program** (Use cases 8, 9).
3. Open **Rajesh** → print the **referral letter** (Use case 5).
4. **X-ray** → capture an order → open the **AERB register** (Use cases 10, 11).
5. **Billing** day-end + **Reports** dashboard (Use cases 6, 14).
6. **Settings → Export** — "your data is always yours" (Use case 15). Close on the ROI sheet.

---

## Use-case catalog

Each use case: **Scenario** (who/why) · **Demo path** (what to click) · **Talking point** (pain → value). Feature/pain-point codes trace back to the PRD.

### 1. Walk-in queue & live token board · F-01/F-02 · PP-01
- **Scenario:** Front desk registers walk-ins and everyone sees the live queue per provider.
- **Demo path:** `Today's Queue` → **Register walk-in** → watch the token appear under the provider → move a patient Check-in → Start → Done.
- **Talking point:** *"This is how your clinic actually runs — walk-ins, not a rigid calendar. Everyone sees who's waiting, so patients are seen near their promised time."*

### 2. No-show recovery: WhatsApp reminder + one-tap reschedule/cancel · F-03/F-21 · PP-02
- **Scenario:** A reminder goes out; the patient can't make it and reschedules/cancels from a link instead of ghosting; the freed slot surfaces to the desk.
- **Demo path:** Queue → **Remind** on a booked row → open `/appt/<id>` (the patient's view; **Confirm / Reschedule / Cancel**, no login) → back on Queue see the **"Reschedule & cancellation requests"** card → **Mark handled**. Pre-seeded: **Fatima** (reschedule), **Prakash** (cancel).
- **Talking point:** *"~1 in 5 slots is a no-show. Turn it into a rebooking: the patient taps a link, you refill the slot. One recovered no-show a week more than pays for this."*

### 3. Patient 3-second history · F-04
- **Scenario:** Doctor opens a returning patient and sees everything at once.
- **Demo path:** `Patients` → open a patient → visits, prescriptions, X-rays, physio, billing, WhatsApp messages, referrals on one screen.
- **Talking point:** *"No plastic folder of old films. The whole history is here — the patient doesn't re-narrate it."*

### 4. Consultation → printable prescription · F-05/F-07
- **Scenario:** Doctor records a visit and hands over a clean Rx.
- **Demo path:** Patient → **New visit** → complaint/diagnosis/plan + Rx lines → save → **Print Rx** (letterhead, NMC no., generic names, Schedule H/H1 flags).
- **Talking point:** *"A legible, compliant prescription on your letterhead — every time, in seconds."*

### 5. Referral letter · F-08
- **Scenario:** Doctor refers a patient to a specialist/hospital.
- **Demo path:** Patient → **Refer** (or per-visit Refer) → form **auto-prefilled from the last visit** → **Generate** → printable letterhead letter (URGENT flag when set). Pre-seeded: **Rajesh** (urgent spine), **Lakshmi** (arthroplasty).
- **Talking point:** *"A professional referral on your letterhead in ten seconds, saved in the patient's history."*

### 6. Billing + day-end reconciliation · F-18/F-20
- **Scenario:** Collect payments, hand over a receipt, and reconcile the day.
- **Demo path:** Patient → **New bill** → collect (Cash/UPI/card) → **Receipt** (GST-aware) · `Billing` → day-end totals by mode + outstanding dues.
- **Talking point:** *"The nightly cash tally, gone — collections by mode reconcile to the drawer, and you can see exactly who owes what."*

### 7. Physiotherapy packages + renewal recovery · F-15
- **Scenario:** Sell a multi-session package; sessions auto-decrement; recover lapsing packages.
- **Demo path:** `Physiotherapy` → **Create package** → **Log session** (balance drops) → **Renewals due** list → **Remind** (WhatsApp recall).
- **Talking point:** *"Stop revenue leaking from forgotten packages — the system flags who's about to lapse and nudges them back."*

### 8. Physio assessment + progress charts · F-13/F-14
- **Scenario:** Objective baseline and visible progress keep patients engaged.
- **Demo path:** Patient → **Assessments & progress** → pain 0–10 + LEFS/PSFS/ODI + ROM → **Pain** & **Function** trend charts. Star: **Deepa** (pain 7→3, LEFS 30→58, ROM 90→125°).
- **Talking point:** *"Show the patient their own recovery curve — that's what keeps them coming back for the full package."*

### 9. Home Exercise Program builder · F-17
- **Scenario:** Physio prescribes home exercises and hands the patient a sheet.
- **Demo path:** Patient → physio → **Build HEP** → pick from the **exercise library** (auto-fills sets/reps) → **Generate** → printable `/hep/<id>` → **Share on WhatsApp**. Star: **Deepa** (knee-rehab program).
- **Talking point:** *"A clear home-exercise sheet on your letterhead, sent to the patient's WhatsApp — better adherence, better outcomes."*

### 10. X-ray order → technician worklist → capture · F-09
- **Scenario:** Doctor orders imaging; the technician captures it with exposure details.
- **Demo path:** `X-ray / Imaging` → **Place imaging order** (region/view/side) → it lands in the **Technician worklist** → **Capture** (phone photo + machine/kVp/mAs + operator). Pre-seeded orders: **Suresh**, **Anita**.
- **Talking point:** *"The ordered view is captured against the right patient — no films floating around, no PACS needed."*

### 11. AERB radiation register · F-12 · PP-18
- **Scenario:** Stay inspection-ready for the X-ray licence.
- **Demo path:** `X-ray / Imaging` → **AERB banner** (licence/RSO/renewal + reminder) → **View / print register** (`/imaging/register`) → full exposure log (kVp/mAs/operator/referrer).
- **Talking point:** *"Every exposure is logged into an AERB register automatically, and we remind you before the licence renewal is due — compliance that generic EMRs skip."*

### 12. X-ray phone-photo capture + WhatsApp share · F-10/F-11
- **Scenario:** Attach the film photo and send the report to the patient.
- **Demo path:** Patient → **Add X-ray** (phone photo) → `Imaging` → **Share** (WhatsApp report-ready). Star: **Lakshmi** (knee X-ray shared).
- **Talking point:** *"The image lives in the record and reaches the patient on WhatsApp — no lost films."*

### 13. WhatsApp outbox + delivery status · F-21
- **Scenario:** See what went to patients and whether it was read.
- **Demo path:** `WhatsApp` → outbox with Sent/Delivered/Read status + message previews (confirmations, reminders with the reschedule link, recalls, report-ready).
- **Talking point:** *"Patients live on WhatsApp — no app to install. Every message is logged with delivery status."*

### 14. Owner dashboard / reports · F-22
- **Scenario:** Owner sees the numbers that matter at a glance.
- **Demo path:** `Reports` → collections, no-show %, outstanding dues, appointments/day, physio renewals due, revenue by service line, 7-day chart.
- **Talking point:** *"Run the practice on data — after 30 days, the recovered-no-show number makes the renewal decision for you."*

### 15. One-click data export / backup · F-26 · (anti–lock-in)
- **Scenario:** Reassure the owner their data is portable and safe.
- **Demo path:** `Settings` → **Export & backup** → a CSV per record type + **Download full backup (JSON)** (owner/admin only).
- **Talking point:** *"Your data is always yours — one click for a spreadsheet or a full backup. No lock-in, no data-loss fear."*

### 16. Compliance config + secure role-based login · settings / F-23
- **Scenario:** Set up clinic identity/compliance, and show that every staff role signs in and sees only what they need.
- **Demo path:** `Settings` (clinic identity, GST, AERB, NMC/KPME, pharmacy toggle) · **Log out** → on `/login` use the one-click **demo logins** to sign in as *Owner* vs *Front Desk* → note the sidebar changes per role.
- **Talking point:** *"Compliant by construction — GST, AERB, NMC handled quietly. And everyone logs in: front desk, doctor and physio each see only what they need — the basis for DPDP access control."*

---

## Feature → use-case status

| Feature | Use case | Status |
|---|---|---|
| Queue & walk-ins (F-01/02) | 1 | ✅ Live |
| Reschedule/cancel link (F-03) | 2 | ✅ Live |
| Patient profile (F-04) | 3 | ✅ Live |
| Visit + Rx (F-05/07) | 4 | ✅ Live |
| Referral letter (F-08) | 5 | ✅ Live |
| Billing + day-end (F-18/20) | 6 | ✅ Live |
| Physio packages (F-15) | 7 | ✅ Live |
| Physio assessment/charts (F-13/14) | 8 | ✅ Live |
| HEP builder (F-17) | 9 | ✅ Live |
| Imaging order + worklist (F-09) | 10 | ✅ Live |
| AERB register (F-12) | 11 | ✅ Live |
| X-ray capture + share (F-10/11) | 12 | ✅ Live |
| WhatsApp outbox (F-21) | 13 | ✅ Live (mock provider; real Meta wired, off by default) |
| Owner dashboard (F-22) | 14 | ✅ Live |
| Data export/backup (F-26) | 15 | ✅ Live |
| Compliance config + role-based login (F-23) | 16 | ✅ Live — real login shipped (PR-A: email+password + one-click demo logins); server-side URL/action enforcement lands in PR-B |

**Partially built:** real authentication (F-23) — **PR-A live** (login + role-scoped menus); full server-side RBAC enforcement is **PR-B**.

**Not yet built (don't demo):** DPDP consent/audit (F-24), pharmacy module (F-29/30), offline mode, object storage for images.

---

## Maintaining this doc

When you build or change a feature, in the **same PR**:
1. Add or update its use case above (Scenario · Demo path · Talking point) and the status table.
2. Bump **Last updated** in the header.
3. If it adds seeded "star" data worth demoing, add it to the star-data table.

**Use-case template:**
```
### N. <Title> · <F-codes> · <PP-codes>
- **Scenario:** <who/why>
- **Demo path:** <exact clicks>
- **Talking point:** *"<pain → value, in the owner's language>"*
```
