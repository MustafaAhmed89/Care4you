# OrthoCare — Small-Clinic Management MVP
## Product Requirements Document (PRD)

> **STATUS: DRAFT v0.2** · **Author:** Mustafa Ahmed (mustafa.ahmed@safepaas.com) · **Date:** 2026-09-27
> **Prepared with:** Claude (Opus 4.8) multi-agent deep-research workflow (patient reviews, staff/owner operations, India regulatory, competitor software, clinical domain workflows).
> **Purpose:** A self-contained, build-ready requirements spec you can feed straight back to Claude to generate a demoable MVP web app for small, doctor-owned clinics in Bengaluru.
> **Changelog:** _v0.2 (2026-09-27)_ — added §14.1–14.3 (recommended WhatsApp BSP, per-clinic cost & ROI model, and the "phone is free" objection-handling); companion interactive calculator `OrthoCare-WhatsApp-ROI-Calculator.html`. · _v0.1 (2026-09-26)_ — initial draft.

---

## 0. How to use this document

This PRD is written to be **fed back verbatim** to start the build. When you are ready to build, paste this document (or point to this file) and say *"build the MVP demo from `OrthoCare-Clinic-MVP-Requirements.md`, starting with the Demoable Core Cut (§9) on the recommended stack (§17)."*

The three build-critical sections are:
- **§8 Scope & §9 Demoable Core Cut** — what to build first for the sell loop.
- **§10 Functional requirements (F-01…F-30)** — feature specs with acceptance criteria.
- **§13 Data model** and **§17 Recommended technical approach** — how to build it.

Before the build, resolve the **§21 Open Questions** (a few need a phone call or visit to the target clinics).

**TL;DR** — Small owner-run ortho clinics in Bengaluru (e.g. **OrthoCure**, RT Nagar; **Chaudhary/Chowdry Orthopedic Center**, Nandi Durga Road) are clinically well-regarded but run entirely on paper and phone calls. The felt pain is **operations, not care**: 1–2 hour waits despite "appointments," 19–30% no-shows, lost paper files, hand-tallied cash, and lapsed physio packages. Incumbent software is either too expensive/complex with hidden per-appointment commissions (Practo Ray) or under-serves the multi-role ortho+physio(+pharmacy) reality (HealthPlix). **The wedge:** a dead-simple, WhatsApp-first, flat-priced clinic OS with an integrated physiotherapy module and offline-tolerant design. Build a tight **6-area demo core** first, prove **WhatsApp reminders** end-to-end before anything else, and demo on the doctor's own clinic identity.

---

## 1. Executive summary

**Problem.** The archetype is a small, owner-run orthopedic clinic in Bengaluru — 3–5 staff including 1–2 physiotherapists, an in-house X-ray unit, sometimes an attached pharmacy. Appointments live in a paper register, patient records are physical files, billing is compiled by hand at day-end, and there is no reminder, follow-up, or reporting capability. This produces exactly the complaints seen in these clinics' and peer clinics' reviews: long waits despite booked slots, unanswered phones, an overwhelmed/"rude" front desk, opaque cash billing, and no way to reschedule. The cost is quantifiable — no-show rates of 19–30% at ~₹6,420–10,120 lost per no-show; a 40-booking/week clinic at 20% no-show loses roughly **₹2.5–4 lakh/month**.

**Opportunity.** The clinical care is not the problem (the doctors are well reviewed) — **operations are**. Incumbent software either over-serves and over-charges (Practo Ray with hidden per-appointment commissions and marketplace lock-in; enterprise HMS like KareXpert/MocDoc, quote-priced and bloated) or under-serves the multi-role reality (HealthPlix is single-doctor, weak pharmacy, no offline; physiotherapy tools are separate cheap silos). **No affordable, simple product bundles ortho + physiotherapy + in-house X-ray + optional pharmacy** for a 3–5 person team with WhatsApp reminders and offline tolerance.

**Product vision (one line).** *A dead-simple, WhatsApp-first clinic operating system for small owner-run specialist clinics that digitizes appointments, patient records, billing, physiotherapy packages and X-ray images in one screen — with pharmacy as an optional toggle — so a 3–5 person team stops losing patients and revenue to paper.*

**The ask (what "done" means for this phase).** A hostable web app that Mustafa can demo on a cheap Android tablet, pre-loaded with a target clinic's own identity, running a real WhatsApp reminder, to close a sale. Then onboard the first paying clinic.

---

## 2. Research methodology, confidence & caveats

This PRD was assembled from a two-pass multi-agent web-research workflow (2026-09-26). Findings are graded and sourced; **please treat the flagged items as point-in-time and verify before making external claims** (per your "verify before asserting / never fabricate" convention).

**What was researched (angles that returned solid, sourced findings):**
1. Reviews & digital footprint of the two named clinics + close peers.
2. Staff/owner operational pain points (industry + vendor blogs, practice-management sources).
3. Patient-side pain points across similar Bengaluru ortho/physio/diagnostic clinics.
4. India regulatory & compliance context (ABDM, DPDP, AERB, pharmacy licensing, GST, NMC, KPME).
5. Competitive software landscape with pricing.
6. Clinical domain workflows (ortho consult, X-ray, physiotherapy, pharmacy).

**Confidence & caveats (read before quoting anything externally):**
- **Review evidence for the two named clinics is paraphrased from search-result summaries, not fully-rendered pages.** Justdial and MouthShut returned HTTP 403 on direct fetch; verbatim Google Maps quotes were not retrievable. Star ratings (OrthoCure ~4.1–4.2; Chowdry ~4.2) are approximate. **Recommended:** do a manual in-browser pull of 50–100 Google/Practo reviews across 5–10 named Bengaluru ortho/physio clinics before the sales pitch to rank themes by true frequency.
- **Chaudhary/Chowdry Orthopedic Center may not be operating** — one Justdial listing tags it "Closed Down" and ClinicSpots shows "No reviews available yet." **Confirm it is live before pitching** (see §21).
- **Competitor prices and the "40–60% no-show reduction" claim are third-party/vendor estimates** — re-verify before using in any ROI pitch.
- **Regulatory specifics (DPDP Rules 2025 timelines/penalties, KPME retention durations, per-drug GST rates, exact AERB log fields)** are largely from secondary summaries; get legal/primary-source confirmation before any "compliant" sales claim.
- The dedicated **GTM/willingness-to-pay** research angle failed to return; pricing tiers here are **benchmarked estimates, not primary WTP data**.
- Some clinical-workflow details (e.g., fracture ICD 7th-character attributes) are inferred from EMR field lists where primary pages were blocked; marked accordingly.

Full source lists are in **Appendix A**.

---

## 3. Target market & the two anchor clinics

**Segment.** Small (3–5 staff), privately-run, single-specialty clinics in Bengaluru — orthopedics as the beachhead, with physiotherapy and in-house X-ray, optionally an attached pharmacy. These clinics are **effectively offline/manual today** and have thin-to-absent digital footprints.

**Anchor clinic 1 — OrthoCure (RT Nagar).**
- Dr. Gaurav Sharma; 415, 2nd Main Rd, 1st Block, RT Nagar 560032; OPD reported Mon–Sat, evening hours.
- ~4.1/5 (≈409 ratings, Justdial summary) / ~4.2/5 (≈145 reviews, Practo summary) — *approximate, from search summaries*.
- **Clinical feedback strongly positive** (doctor "highly recommended"; patients recover after consult + physiotherapy) — confirms the sellable gap is admin/ops, not care.
- Recurring complaints: **long waits despite booked appointments**; a specifically named **rude receptionist** under load; runs **physiotherapy** alongside consults.
- Source: `https://www.justdial.com/Bangalore/Orthocure-Clinic-Near-To-Kfc-Rt-Nagar/080P3027824_BZDET`, `https://www.mouthshut.com/product-reviews/orthocure-clinic-rt-nagar-bangalore-reviews-926099955`, `https://www.practo.com/bangalore/doctor/dr-gaurav-sharma-orthopedist`

**Anchor clinic 2 — Chaudhary / Chowdry Orthopedic Center (Nandi Durga Road, Jayamahal).**
- No.19, near MedPlus Pharmacy, Jayamahal 560046; Dr. Azhar Almas C M; consult fee listed ₹300.
- **Almost no usable online reviews** — ClinicSpots "No reviews available yet"; one Justdial listing labels it **"Closed Down."** The near-absent footprint is itself the finding (these clinics are invisible online) — **but confirm the clinic is still operating** before targeting it.
- Source: `https://www.clinicspots.com/clinic/chowdry-orthopaedic-centre`

**Why this segment is a good beachhead.** Care quality is high but operations are broken; owners feel the pain daily (night cash tally, reputation hits); incumbents leave them underserved; and the buyer (owner-doctor) is also the daily champion, shortening the sale.

---

## 4. Personas

| # | Persona | Role | Primary device | Tech comfort |
|---|---------|------|----------------|--------------|
| P1 | **Dr. Gaurav** (owner-doctor) | Sees patients + runs the business | Windows laptop in consult room; personal Android (WhatsApp) | Medium |
| P2 | **Bharathi** (front-desk/receptionist) | Registration, queue/token, phone booking, cash+UPI, filing | Cheap Android tablet/phone at desk | Low–medium |
| P3 | **Priya** (physiotherapist) | Multi-session rehab: assessment, sessions, home exercises | Android phone/tablet in physio area | Medium |
| P4 | **Ramesh** (pharmacist) *[optional — only pharmacy clinics]* | Dispense against Rx, bill medicines, stock | Counter desktop + bill printer | Medium |
| P5 | **Suresh & family** (patient + attendant) | Ortho/physio patient, often in pain/elderly | Personal smartphone — **WhatsApp is the only reliable channel** | Mixed |
| P6 | **Manoj** (X-ray technician) | Captures X-rays, gets image to doctor & patient | X-ray console + a clinic Android phone | Medium |

**P1 — Dr. Gaurav (owner-doctor archetype).**
- *Context:* solo/lead doctor in a 3–5 staff clinic; well-reviewed clinically; business runs on paper register, physical files, a cash drawer; does the day-end cash tally himself most nights.
- *Goals:* see more patients without chaos; stop revenue leaking to no-shows/unbilled charges/lapsed packages; know daily collections & dues at a glance; hand patients a clean prescription/receipt; look modern vs bigger hospitals.
- *Frustrations:* wait-time & "rude receptionist" complaints hurt reputation; can't find old files/X-rays fast; nightly manual cash reconciliation; forgotten follow-ups; can't tell which physio packages lapsed; wary of expensive/complex software and lock-in.
- *Needs:* one screen, minimal training, nothing that slows the consult.

**P2 — Bharathi (front-desk/receptionist).**
- *Context:* single receptionist absorbing every patient at peak — greets walk-ins, writes the register, answers the phone, takes payment, pulls files. Named in real reviews as the friction point under load.
- *Goals:* register + queue patients fast; give an honest "you're #6, ~40 min"; stop double-booking; reconcile cash/UPI without gaps; not get shouted at.
- *Needs:* productive in **under a day** of training; touch-friendly; possibly **Kannada/Hindi** labels.

**P3 — Priya (physiotherapist).**
- *Context:* runs 6–10 session packages sold at the desk; tracks sessions on a paper card; remembers exercises verbally.
- *Goals:* objective baseline & re-measure (pain 0–10, ROM, LEFS/ODI); show visible progress; know remaining sessions; keep patients from dropping off; send home exercises they follow.
- *Needs:* quick tap-to-log, not essays.

**P4 — Ramesh (pharmacist) [OPTIONAL].**
- Only in clinics with an attached pharmacy. Wants fast dispense against the doctor's Rx, GST-correct medicine bill, no stockouts/expiry loss, drug-inspector-ready Schedule H/H1 registers.

**P5 — Suresh & family (patient + attendant).**
- Books by phone or walks in; carries a plastic folder of old films/prescriptions; pays cash/UPI; coordinates over WhatsApp. Wants to be seen near the promised time, not re-narrate history, get a legible Rx + receipt (insurance/80D), access reports remotely, simple reminders, easy reschedule. **WhatsApp is near-universal even for elderly/low-literacy users; app installs and portals are a barrier.**

**P6 — Manoj (X-ray technician).**
- Basic CR/DR or plain-film unit, **no PACS**. Image reaches the doctor as a physical film or a phone photo; patient carries the film out. Wants the ordered view captured and attached to the right patient/visit quickly, shared without loss, and an AERB exposure/study log.

---

## 5. Pain-point catalog (evidence-grounded, ranked)

Ranked most-severe first. Each has a stable ID used by the feature specs (§10). Severity: **Critical / High / Medium / Low**. Sources are the strongest single reference; more in Appendix A.

| ID | Pain point | Who | Severity | Frequency |
|----|-----------|-----|----------|-----------|
| PP-01 | Long, unpredictable waits despite a "booked" appointment | Patients, front-desk, owner rep. | **Critical** | Every peak session |
| PP-02 | No-shows / un-reminded appointments leak major revenue | Owner, doctor, front-desk | **Critical** | Daily (~1 in 5 slots) |
| PP-03 | Paper-only records: lost files, slow retrieval, history re-narrated | Doctor, front-desk, patients | **Critical** | Every return visit |
| PP-04 | Walk-in/token reality unmanaged — no live queue, order disputes | Front-desk, walk-ins | High | Every peak session |
| PP-05 | Manual day-end billing & cash/UPI reconciliation misses charges | Billing, owner | High | Every day at close |
| PP-06 | Pending dues leak; owner has no MIS view | Owner, billing | High | Ongoing/weekly |
| PP-07 | No follow-up/recall → physiotherapy drop-off | Physio, owner, patient | High | Every physio course |
| PP-08 | Physio packages tracked on paper — counting errors, missed renewals | Physio, front-desk, owner | High | Every package/session |
| PP-09 | Unanswered phones / busy lines for booking & status | Patients, front-desk | High | Daily, peak |
| PP-10 | Overwhelmed front desk turns "rude" under load | Front-desk, patients, owner rep. | High | Every peak session |
| PP-11 | Opaque cash billing — no GST-ready receipt for insurance/80D | Insured patients, owner trust | Medium | Most visits |
| PP-12 | X-ray films are physical, lost/carried, hard to get into a record | Ortho patients, technician, doctor | Medium | Every imaging visit |
| PP-13 | No remote access to reports/records; low continuity | Patients (incl. NRIs), 2nd-opinion | Medium | Ongoing |
| PP-14 | Rushed consult with nothing in writing / illegible Rx | Patients, doctor | Medium | Common |
| PP-15 | Paper→digital migration is the real adoption blocker | Owner/staff, the vendor | Medium | One-time, blocks every sale |
| PP-16 | Crowded, cramped waiting rooms in converted-house clinics | Elderly/mobility-impaired patients | Low | Peak sessions |
| PP-17 | Pharmacy stockouts/expiry & Schedule H/H1 register burden *[pharmacy only]* | Pharmacist, owner | Medium | Ongoing (pharmacy clinics) |
| PP-18 | Compliance exposure: DPDP consent, AERB X-ray licence, NMC Rx norms | Owner, doctor | Medium | Continuous obligation |

**Detail on the Critical/High items:**

- **PP-01 — Long waits despite a booked slot.** A confirmed slot doesn't mean being seen on time; patients wait 1–2+ hours because there is no real slotting and walk-in arrival order overrides the register. Acute for ortho patients in pain/on crutches. *Evidence:* MouthShut/Cutis reviews of peer clinics report waits ">2 hours" / "1 to 1.5 hours even after taking appointments"; an Indian OPD study measured mean registration-to-doctor of 98.6 min; Ipsos ~55% of Indians say waits are too long. *Source:* `https://www.mouthshut.com/product-reviews/orthocure-clinic-rt-nagar-bangalore-reviews-926099955`

- **PP-02 — No-shows leak revenue.** Appointments treated as soft commitments; 19–30% no-show with no confirmation/reminder or easy reschedule. *Evidence:* "average no-show rate… was 19.4%"; "₹6,420–10,120 lost per no-show"; a 40-booking/week clinic at 20% loses "₹2,56,800 to 4,04,800 every month." *Source:* `https://www.engageoagency.com/blog/how-to-reduce-patient-no-shows-indian-clinics`

- **PP-03 — Paper records.** Physical files get lost/damaged, slow to search; continuity depends on the patient carrying prior papers. *Evidence:* study — 73.5% of patients had doctors request previous records; 23% had forgotten them; retrieval "sometimes impossible." *Source:* `https://pmc.ncbi.nlm.nih.gov/articles/PMC11463868/`

- **PP-04 — Walk-in/token unmanaged.** Order is "first come first serve" in practice but invisible/unmanaged, so later arrivals jump ahead and patients game arrival time. *Evidence:* Justdial reviews — told "first come first serve" but later arrivals served first; Practo — app-bookers "given first preference." *Source:* `https://www.justdial.com/Bangalore/Clinics/nct-10101647`

- **PP-05 / PP-06 — Billing, reconciliation & dues.** Charges compiled by hand at close, split across cash/UPI/card, making reconciliation a "month-end guess"; dues chased "awkwardly, or not at all… written off out of exhaustion"; owner can't answer who owes what. *Sources:* `https://www.easyclinic.io/clinic-cash-flow`, `https://mybillbook.in/blog/how-hospital-track-payments-deposits-dues/`

- **PP-07 / PP-08 — Physio drop-off & package tracking.** Multi-session physio patients quietly stop coming when they feel slightly better; packages counted by hand cause disputes and missed renewals. *Evidence:* "automated session tracking… eliminates manual counting… alerting staff when a renewal is due"; WhatsApp reminders cut no-shows meaningfully in India (487M users). *Sources:* `https://physiocarepms.com/blogs/physiotherapy-clinic-management-software-features/`, `https://boringaimanual.substack.com/p/the-physio-clinic-that-keeps-patients`

- **PP-09 / PP-10 — Phones & front-desk overload.** A single receptionist juggling walk-ins, billing and the phone means calls go unanswered and reception "turns rude" under load (named in reviews). It's a workflow-overload symptom, not an attitude problem. *Sources:* `https://clinicappointments.com/call-answering/`, `https://www.mouthshut.com/product-reviews/orthocure-clinic-rt-nagar-bangalore-reviews-926099955`

*(PP-11 through PP-18 detail is embedded in the feature specs' "addresses" mapping and the regulatory section §12.)*

---

## 6. Competitive landscape

Three tiers, each leaving the target clinic underserved. **All prices are point-in-time third-party/aggregator estimates — re-verify before quoting.**

| Product | Positioning | Indicative price | Covers | Key gap for our target |
|---|---|---|---|---|
| **Practo Ray** | Market leader, mid/large practice | ~₹1,000–4,500/mo **+ hidden ₹1,500–3,000/mo** marketplace/per-appointment commissions | Appointments, EMR, e-Rx, billing, reminders, ABHA | Oversized & "friction" for solo; marketplace lock-in; unpredictable cost |
| **HealthPlix** | India's largest EMR (14k+ doctors) | ₹11,999–17,999/yr | Fast multilingual Rx, patient mgmt, billing | **Single-doctor only**, weak pharmacy, **no offline** |
| **KareXpert / MocDoc / Medixcel** | Enterprise HMS / clinic chains | Quote-only (MocDoc cited ~₹3.5L, single-source) | Full HMS incl. LIMS/RIS/pharmacy | Built for hospitals/chains; overwhelms a 3-doctor clinic |
| **Halemind** | Affordable SMB HMS | ₹999 / 2,499 / 4,999 per mo (radiology add-on) | OPD, e-Rx, case sheets, billing, queue | Good price benchmark; physio not a focus |
| **Clinicea** (Bengaluru-founded) | Affordable, offline-capable | ~₹1,999/mo | Scheduling, EMR, billing, inventory, **offline sync** | Strong value benchmark; generic (not ortho/physio) |
| **DocEngage** (Bengaluru) | Cloud CRM/HMS | USD per-user (~$29–69) | CRM, telemed, EHR, HMS | Pricey at 4–5 seats |
| **PappyJoe** | Clinic/dental, offline+pharmacy | Quote-only | EMR, billing, lab, pharmacy, offline | No public price (friction) |
| **Bajaj Finserv Health e-clinic** | Comms/telemedicine-led | Flat ~₹8,999 | Appointments, records, billing, virtual receptionist, ABHA | Shallow clinical/imaging/physio |
| **CrelioHealth** | Diagnostics LIMS | ~₹10k–50k/mo | Lab/diagnostics, ABDM APIs | Lab-centric; overkill for basic X-ray |
| **Physio tools** (PhysioCare PMS, Physiqcian, PhysioPlus) | Standalone physio | ₹300–3,000/mo | Exercise library, packages, session tracking | Siloed; not integrated with ortho/billing/X-ray |

**Three verified wedges for our MVP:**
1. **Integrated physiotherapy module** (assessment depth + packages) that general EMRs (Practo, HealthPlix, Medixcel) lack.
2. **Offline-tolerant operation** for India's intermittent connectivity — a genuine buying criterion only a few (Clinicea, PappyJoe) offer.
3. **Flat, transparent, no-commission, no-forced-marketplace pricing** with deliberate simplicity — the opposite of Practo/KareXpert.

*Sources:* `https://www.cufront.com/blog/practo-ray-pricing-india-worth-it-2026`, `https://www.techjockey.com/reviews/healthplix`, `https://halemind.com/hospital_management_software`, `https://clinicea.com/`, `https://www.vivalynlabs.com/blog/best-emr-software-small-clinics-india-2026` (full list in Appendix A).

---

## 7. Product principles & positioning

**Positioning line:** *"The clinic app built for how small clinics actually run — walk-ins, WhatsApp, and cash — not a hospital system shrunk down."*

**Design principles (non-negotiable):**
1. **Walk-in/queue first, booking second.** These clinics are token-dominant; the daily backbone is a live queue, not a calendar.
2. **WhatsApp-first, no app install.** Patients live on WhatsApp; reminders, receipts, reports and reschedule links go there. No patient app in MVP.
3. **One screen, <1 day training.** Every core task in a few taps; nothing that slows the consult.
4. **Mobile/tablet-first.** The front desk runs a cheap Android tablet, not a laptop.
5. **Flat, transparent pricing.** No per-appointment fees, no marketplace, no lock-in.
6. **Your data is yours.** One-click export + backup shown proactively — kills the two biggest fears (lock-in, data loss).
7. **Deliberate simplicity.** Ship a tight core; keep pharmacy/consent/audit out of the way unless needed.
8. **Compliant by construction, quiet by default.** DPDP consent, NMC Rx number, AERB register handled in the schema; not demo clutter.

---

## 8. Scope

### 8.1 Module map (8 modules; Pharmacy is a per-clinic optional toggle, off by default)

1. **Appointments & Queue** — provider calendars, slotting, booking/reschedule/cancel, walk-ins, live token/queue, waitlist. *(MVP core)*
2. **Patient Records / EMR** — patient master, visit history, ortho notes, injury sub-record, prescriptions (generic default + NMC no.), optional ABHA, consent capture. *(MVP core)*
3. **Billing & Invoicing** — itemized bills, multi-mode payments, dues ledger, day-end reconciliation, GST-aware line separation. *(MVP core)*
4. **X-ray / Imaging** — study log, phone-photo / JPEG-PDF ingest, report/film attach & WhatsApp share, AERB register. *(MVP core, thin)*
5. **Physiotherapy** — assessment (pain/ROM/functional scale), packages, session tracking, therapist scheduling, HEP, renewal alerts. *(MVP core — key differentiator)*
6. **Pharmacy (OPTIONAL, TOGGLE-ABLE)** — dispense against Rx + Schedule H/H1 register + GST bill; full inventory deferred. *(MVP optional / mostly later)*
7. **Reports / Admin** — owner dashboard, role-based user mgmt, clinic config (GST status, pharmacy toggle, licence numbers). *(MVP core)*
8. **Patient Communications** — WhatsApp-first confirmations/reminders/report-sharing/reschedule links, SMS fallback. *(MVP core — cross-cutting)*

Plus two supporting concerns: **Onboarding & Migration** and **Compliance & Data** (see features F-24 to F-28).

### 8.2 MoSCoW summary (MVP)

- **Must:** F-01, F-02, F-04, F-05, F-07, F-10, F-13, F-15, F-16, F-18, F-20, F-21, F-23, F-24, F-25, F-28.
- **Should:** F-03, F-06, F-09, F-11, F-12, F-14, F-17, F-19, F-22, F-26, F-27.
- **Could:** F-08, F-29 (pharmacy dispense/register — behind toggle).
- **Won't (this MVP):** F-30 (full pharmacy inventory/FEFO), live ABDM M1/M2/M3 certification, teleconsultation/video, patient mobile app, lab/LIMS, inpatient/beds, multi-branch/chain, insurance/TPA claims, offline-first sync engine (design for it; defer full build).

### 8.3 Demoable Core Cut (build & demo FIRST — the sell loop)

Build just **six areas**; hide/stub the rest. This is what makes the demo land on a weeks-long sell timeline and reads as "simple."

1. **Appointments & QUEUE** — walk-in token + live queue, with light booking (F-01/F-02). *Lead here — walk-in-dominant.*
2. **WhatsApp confirmations + 24h/2h reminders** (F-21). *The ROI wedge — must genuinely work (real BSP + approved template), not a mock.*
3. **Patient search + records + print/share prescription** (generic + NMC no.) (F-04/F-07). *3-second history + the tangible paper artifact.*
4. **Billing + day-end collections reconciliation** (F-18/F-20). *Replaces the nightly manual cash tally.*
5. **Physio package auto-decrement + renewal-due alert** (F-15). *The differentiator; visible recovered revenue.*
6. **X-ray phone-photo capture + WhatsApp share** (F-10/F-11, thin). *Imaging without PACS.*

**Build prerequisites (not demo steps):** seeded demo data (F-27) and migration tooling (F-25). **Fully hidden** behind toggle: Pharmacy (F-29/F-30) unless the specific clinic runs one and asks.

---

## 9. Functional requirements (feature specs F-01 … F-30)

Legend: **M/S/C/W** = MoSCoW · **MVP** = in first shippable · **Demo** = in the Demoable Core Cut · **Eff** = rough effort (S/M/L).

### Module: Appointments & Queue

**F-01 — Walk-in registration + live token queue (daily backbone)** · M · MVP · **Demo** · Eff M
Register a walk-in in one tap, auto-assign a token, show a live queue board with position and rough wait per provider. Queue is the primary daily screen; booked appointments merge into the same ordered list. Mark checked-in / in-consult / done.
*User story:* As a receptionist, I want to register walk-ins and see one honest live queue, so I can tell each patient their position and stop order disputes.
*Acceptance:* register a walk-in in ≤15s with name+phone; token issued; queue shows position + estimated wait; booked + walk-in in one ordered list per provider; status transitions logged; usable on an Android tablet.
*Addresses:* PP-01, PP-04, PP-10.

**F-02 — Provider appointment booking (secondary to queue)** · M · MVP · **Demo** · Eff M
Day/week calendar per provider (doctor + each physiotherapist) with realistic slot lengths, double-booking prevention, source tagging (phone/walk-in/WhatsApp link). Booking feeds the same queue.
*User story:* As front-desk, I want to book a slot for a provider without double-booking, so planned patients have a real time, not just a name in a register.
*Acceptance:* create/move a booking; overlapping slots blocked per provider; booking triggers WhatsApp confirmation (F-21); booking flows into the queue on the day.
*Addresses:* PP-01, PP-09.

**F-03 — One-tap reschedule / cancel link** · S · MVP · Eff M
WhatsApp confirmation carries a reschedule/cancel link; freed slots surface to the desk to refill, converting would-be no-shows into rebookings.
*Acceptance:* link reschedules/cancels without login; freed slot flagged at desk; action logged; status → rescheduled/cancelled (not no_show).
*Addresses:* PP-02, PP-09.

### Module: Patient Records / EMR

**F-04 — Patient master + 3-second search** · M · MVP · **Demo** · Eff M
Searchable profile (name/phone/ID) with demographics, optional ABHA field, visit history, attached documents/X-rays.
*User story:* As a doctor, I want to pull any patient's full history in seconds, so I stop asking patients to re-narrate and re-carry records.
*Acceptance:* partial name/phone search returns results <3s; profile shows visit history, prescriptions, linked imaging; duplicate-phone warning on create.
*Addresses:* PP-03, PP-13.

**F-05 — Ortho visit note: first-visit vs follow-up templates** · M · MVP · Eff M
Structured encounter: chief complaint, HPI, exam (inspection/palpation/ROM/stability/strength), diagnosis, plan, next return interval; distinct first-visit vs follow-up layouts with interval-progress carry-forward.
*Acceptance:* choose first/follow-up; first captures full history+exam; follow-up pre-fills prior diagnosis and shows interval; note saved to visit and searchable.
*Addresses:* PP-03, PP-14.

**F-06 — Structured injury / fracture sub-record** · S · MVP · Eff S
Attach a structured injury object to a visit: site/bone/region, laterality (L/R), mechanism, encounter type (initial active-treatment vs subsequent/healing) that imaging and treatment link to.
*Addresses:* PP-03.

**F-07 — Prescription: generic-name default, NMC number, print-to-PDF** · M · MVP · **Demo** · Eff M
Rx builder that defaults the drug field to generic name (brand secondary), flags Schedule H/H1, and prints/shares a legible PDF on clinic letterhead with the doctor's NMC/EMRB registration number. First-class demoable artifact.
*User story:* As a doctor, I want to hand the patient a clean printed prescription with my registration number, so it's legible, compliant and reusable.
*Acceptance:* Rx lines with generic (brand optional), dose/frequency/duration; H/H1 flag; PDF on letterhead shows clinic details + doctor NMC no.; printable and WhatsApp-shareable.
*Addresses:* PP-14, PP-11, PP-18.

**F-08 — Referral letter on clinic letterhead** · C · MVP · Eff S
Generate a referral/second-opinion letter on letterhead (patient demographics, referring physician, history, findings, investigations, specific referral question) — distinct from the visit note.
*Addresses:* PP-14, PP-13.

### Module: X-ray / Imaging

**F-09 — Imaging order (region + view + side)** · S · MVP · Eff S
Doctor places an imaging order (region, projection/view, side) linked to the visit/injury; appears in the technician worklist.
*Addresses:* PP-12.

**F-10 — X-ray capture via phone photo / JPEG-PDF upload, linked to visit** · M · MVP · **Demo** · Eff M
First-class image ingest for clinics with **no PACS**: photograph the physical film with a clinic phone OR upload a JPEG/PDF/BMP exported from a CR/DR console; tag it to patient/visit/order. **DICOM deferred.**
*User story:* As a technician, I want to attach a phone photo or exported file of the X-ray to the patient, so the image lives in the record instead of on a film that gets lost.
*Acceptance:* upload from phone camera or file; auto-links to selected patient/order; thumbnail on patient profile; multiple images per study; works on Android.
*Addresses:* PP-12, PP-03.

**F-11 — Share X-ray / report to patient via WhatsApp** · S · MVP · **Demo** · Eff S
Send the stored image/report as a WhatsApp link/attachment so patients don't carry physical films.
*Acceptance:* one-tap share via WhatsApp (utility template/session); share event logged; consent respected.
*Addresses:* PP-12, PP-13.

**F-12 — Study log + AERB / exposure register** · S · MVP · Eff M
Per-study record (patient, body part, date, referring doctor, report status) + equipment/exposure log (machine model, kVp/mAs, view) + clinic AERB licence no., RSO/operator, renewal date & reminder.
*Addresses:* PP-12, PP-18.

### Module: Physiotherapy (key differentiator)

**F-13 — Physio initial assessment (pain 0–10, ROM, functional scale)** · M · MVP · Eff M
Structured intake: complaint, injury duration, numeric pain score (VAS/NPRS 0–10), per-joint ROM (goniometer), selectable validated functional scale (LEFS/PSFS/Oswestry) stored as scored fields — the objective baseline.
*User story:* As a physiotherapist, I want to capture pain, ROM and a functional score as numbers, so I have an objective baseline to prove progress.
*Acceptance:* numeric pain 0–10; ROM per joint; ≥1 validated scale scored & stored with date; saved to patient for re-measurement.
*Addresses:* PP-07, PP-14.

**F-14 — Re-assessment + progress charting** · S · MVP · Eff M
Repeat the scored instruments over time; chart pain/ROM/function initial → ongoing → discharge; visible to therapist, doctor, patient.
*Addresses:* PP-07.

**F-15 — Multi-session package: auto-decrement, expiry, renewal alert** · M · MVP · **Demo** · Eff M
Sellable package (e.g., 10 sessions) linked to patient; balance auto-decrements as sessions consumed; tracks expiry; alerts staff on low balance/lapse to prompt renewal.
*User story:* As an owner, I want physio packages to track themselves and flag renewals, so I stop losing money to miscounting and lapsed courses.
*Acceptance:* create package (total sessions+price+expiry); each session decrements balance; remaining shown to staff & patient; renewal-due alert on low balance/expiry.
*Addresses:* PP-08, PP-07, PP-06.

**F-16 — Per-session attendance + progress note + therapist scheduling** · M · MVP · Eff M
Each session records date, therapist, attended y/n, SOAP/progress note, updated measures; scheduled against a therapist's calendar (shared with the doctor's to avoid clashes).
*Acceptance:* mark attended → decrements package (F-15); note saved; therapist calendar prevents clashes; missed session flagged for recall.
*Addresses:* PP-08, PP-07, PP-04.

**F-17 — Home Exercise Program builder + WhatsApp share** · S · MVP · Eff M
Prescribe exercises with instructions from a simple library; send the HEP to the patient via WhatsApp.
*Addresses:* PP-07, PP-14.

### Module: Billing & Invoicing

**F-18 — Itemized bill, multi-mode payment, GST-aware lines** · M · MVP · **Demo** · Eff M
Itemized invoice (consult/procedure/physio/X-ray/pharmacy); split payments (cash/UPI/card); separate GST-exempt healthcare-service lines from taxable pharmacy/OTC lines with per-item HSN/rate when GST-registered (config flag).
*User story:* As front-desk, I want to bill all charges with correct payment modes and GST, so nothing is missed and the patient gets a proper receipt.
*Acceptance:* multi-line invoice; split/partial payments across modes; exempt vs taxable lines separated; GST applied only when registered flag on; GST-correct PDF receipt printed/shared.
*Addresses:* PP-05, PP-11.

**F-19 — Outstanding dues ledger + follow-up** · S · MVP · Eff S
Track partial/unpaid balances per patient; show total outstanding; prompt WhatsApp payment follow-ups.
*Addresses:* PP-06.

**F-20 — Day-end collections reconciliation** · M · MVP · **Demo** · Eff S
One-click day-end report totalling collections by mode (cash/UPI/card) to reconcile against the physical drawer — replaces the nightly manual tally.
*User story:* As an owner, I want a one-click day-end tally by payment mode, so I stop reconciling the cash drawer by hand every night.
*Acceptance:* report shows total + per-mode collections for a date; lists transactions; exportable; matches counter.
*Addresses:* PP-05, PP-06.

### Module: Patient Communications

**F-21 — WhatsApp confirmations + 24h/2h reminders** · M · MVP · **Demo** · Eff L
WhatsApp-first booking confirmation + 24h & 2h reminders via approved **utility** templates through a BSP, with opt-in captured at registration and SMS fallback. **The core ROI wedge — build and prove first.** (See §14 for the WhatsApp reality note.)
*Acceptance:* opt-in captured; confirmation on booking; 24h+2h reminders via approved utility template; delivery/read status logged; SMS fallback; reminders suppressed without opt-in.
*Addresses:* PP-02, PP-09, PP-01.

### Module: Reports / Admin

**F-22 — Owner dashboard (collections, no-shows, dues, renewals, revenue by service line)** · S · MVP · Eff M
Daily/weekly view: collections, no-show rate, outstanding dues, appointments/day, physio renewals due, revenue by service line and by referring doctor (referrals drive X-ray).
*Addresses:* PP-06, PP-02, PP-08.

**F-23 — Role-based logins (owner / front-desk / physio / pharmacist)** · M · MVP · Eff S
Per-role access so each staff type sees only what they need; drives DPDP access control.
*Acceptance:* roles owner/front-desk/physio/pharmacist(+admin); menus & data scoped by role; users active/inactive; all scoped by clinic.
*Addresses:* PP-18.

### Module: Compliance & Data

**F-24 — Consent capture + audit log + soft-delete (DPDP baseline)** · M · MVP · Eff M
Capture & record explicit patient consent with a plain-language notice; log data access; soft-delete/archive only (never hard delete). **Schema-first; minimal UI for MVP.**
*Acceptance:* consent status + timestamp per patient; notice shown at registration; access/actions written to audit log; delete is soft-delete only.
*Addresses:* PP-18, PP-13.

**F-26 — One-click data export / backup (anti-lock-in)** · S · MVP · Eff S
Export patients/visits/billing to CSV/PDF and take a backup on demand — counters lock-in and data-loss fears.
*Addresses:* PP-15, PP-13.

### Module: Onboarding & Migration

**F-25 — Paper-to-digital migration & quick-add onboarding** · M · MVP · Eff M
Day-1 tooling: CSV/Excel bulk import template, a fast quick-add form, and **progressive capture** (add full history on the patient's next visit rather than back-entering everything). See §15.
*Acceptance:* import patients from CSV/Excel via template; quick-add <20s/patient; imported patients searchable; migration progress visible; supports "capture history on next visit" mode.
*Addresses:* PP-15, PP-03.

**F-27 — Seeded demo data pack (their clinic's identity)** · S · MVP · Eff S
Loadable demo dataset mirroring the target clinic: name/logo, doctor's real name+NMC no., realistic local patient names, an ortho day schedule, physio packages, sample bills — so demos never run on empty screens.
*Acceptance:* demo pack loads clinic identity + realistic data in one step; resettable; clearly separated from production data.
*Addresses:* PP-15.

### Module: Cross-cutting UI

**F-28 — Mobile / tablet-first responsive UI** · M · MVP · Eff M
Design front-desk & physio screens for a cheap Android phone/tablet first, large touch targets, optional Kannada/Hindi labels.
*Acceptance:* queue, registration, billing and physio flows fully usable on a ~7–10in Android screen; touch-friendly; key labels localizable.
*Addresses:* PP-04, PP-10.

### Module: Pharmacy (OPTIONAL toggle — off by default)

**F-29 — Dispense against Rx + Schedule H/H1 register + GST bill** · C · *not in first MVP* · Eff L
Behind a per-clinic toggle: dispense linked to the visit's prescription, flag Schedule H/H1 items, force the **H1 8-field register** (incl. batch no., 3-year retention, tamper-proof/printable), capture prescriber details, produce a GST-correct medicine bill. Hidden in the core demo unless asked.
*Addresses:* PP-17, PP-11, PP-18.

**F-30 — Batch/expiry stock with FEFO + reorder/expiry alerts** · W (won't, this MVP) · Eff L
Full pharmacy inventory: drug master, batch-level MRP/expiry, FEFO dispensing, block negative stock, expiry & reorder alerts. Deferred beyond MVP.
*Addresses:* PP-17.

---

## 10. Domain workflows (step sequences)

**A) Ortho consult loop (walk-in-first).**
1. Patient arrives (mostly walk-in) → front-desk registers/searches, issues token, adds to live queue (F-01/F-04).
2. Booked patients merge into the same queue by arrival+slot (F-02).
3. Doctor calls next token; opens patient → full history + prior X-rays in <3s (F-04).
4. Doctor picks first-visit or follow-up note; captures complaint/exam/diagnosis; for injuries adds the structured injury record (site/side/mechanism, initial vs subsequent) (F-05/F-06).
5. If imaging needed → imaging order (region/view/side) (F-09).
6. Doctor prescribes — generic-name default, H/H1 flag, prints/shares PDF Rx on letterhead with NMC no. (F-07); referral letter if referring out (F-08).
7. Doctor sets next return interval (~4–6 weeks typical) → follow-up booked + WhatsApp confirmation (F-02/F-21).
8. Front-desk bills the visit and collects payment (F-18). Status: booked/walk-in → checked-in → in-consult → done, all logged.

**B) X-ray order → capture → report → share (no PACS).**
1. Imaging order lands in the technician worklist (F-09).
2. Technician captures the film on the machine.
3. **Image entry (realistic path):** technician photographs the film with a clinic Android phone, OR uploads a JPEG/PDF/BMP exported from a CR/DR console; file tagged to patient/visit/order (F-10). *DICOM is a later, optional enhancement.*
4. Optional impression/report text; study status → ready (F-12).
5. Image stored on the patient profile; exposure/machine details + AERB licence/RSO/renewal captured (F-12).
6. One-tap WhatsApp share to the patient so no physical film is carried (F-11).

> **Evidence for the phone-photo path:** Indian hospitals have advised patients to photograph X-rays on mobile phones; smartphone-photo-over-WhatsApp diagnosis is documented as reliable and "legally valid" under India's Telemedicine Practice Guidelines; CR/DR consoles export JPEG/TIFF/BMP. *Sources:* `https://medicaldialogues.in/news/health/hospital-diagnostics/x-ray-film-shortage-row-kmc-hospital-asks-patients-to-use-mobile-photos-168438`, `https://pubmed.ncbi.nlm.nih.gov/35070657/`, `https://pmc.ncbi.nlm.nih.gov/articles/PMC3354356/`

**C) Physio assessment → package → session → HEP loop.**
1. Doctor refers to physio; front-desk sells a multi-session package (e.g., 10 sessions) with price+expiry (F-15).
2. Physiotherapist does the initial assessment: numeric pain 0–10 (VAS/NPRS), per-joint ROM (goniometer), a validated functional scale (LEFS/PSFS/Oswestry) as baseline (F-13).
3. Sessions scheduled against the therapist's calendar, merged with the doctor's to avoid clashes (F-16).
4. Each session: mark attendance → package balance auto-decrements; write SOAP/progress note; update pain/ROM/scale (F-16/F-14).
5. Build and WhatsApp a Home Exercise Program (F-17).
6. Re-assessment charts progress initial → ongoing → discharge (F-14).
7. Missed session → recall reminder; low balance/expiry → renewal-due alert (F-15/F-21).
8. Discharge outcome recorded.

> **Evidence:** VAS/NPRS pain scales are 0–10; goniometer measures joint ROM; LEFS (20 items), PSFS and Oswestry Disability Index are standard functional outcome instruments; physio revenue is package-based with auto-tracked usage/expiry/renewal. *Sources:* `https://www.writeupp.com/blog/outcome-measures`, `https://physiocarepms.com/features/treatments/`

**D) Pharmacy dispense loop (OPTIONAL, only if module toggled on).**
1. Patient brings the doctor's Rx (already in-system) to the counter.
2. Pharmacist opens the linked prescription; the app flags Schedule H/H1 items (F-29).
3. For H/H1, prescriber name+registration and (H1) the **8 mandatory fields incl. batch number** are forced; sale blocked without a linked Rx (F-29).
4. Dispense (FEFO from batch when full inventory enabled — deferred F-30).
5. Generate a GST-correct medicine bill with HSN/rate, batch no. printed (F-29/F-18).
6. H1 register auto-updated (retained 3 years, tamper-proof, printable).
7. Pharmacy collection flows into day-end reconciliation (F-20).

> **Evidence:** Schedule H requires a prescription register; Schedule H1 requires a separate 8-field register (date, brand, generic, quantity, batch no., patient name+address, prescriber name, prescriber reg. no.), retained ≥3 years, tamper-proof and printable. *Sources:* `https://shelflifepro.in/blog/schedule-h1-drug-register-compliance-guide/`, `https://www.medicolegalservices.in/schedule-h-drugs-india-prescription-rules/`

---

## 11. Data model (entities, key fields, relationships)

Multi-tenant: every record is scoped by `clinic_id`. All tables carry standard audit columns (`created_by`, `creation_date`, `last_updated_by`, `last_update_date`) and use **soft-delete** (no hard delete).

- **Clinic** (`clinic_id`, name, address, `kpme_reg_no`, `aerb_licence_no`, `aerb_rso_name`, `aerb_renewal_date`, `gst_registered_flag`, `gstin`, `pharmacy_module_enabled_flag`, logo, letterhead fields) — tenant root.
- **User/Staff** (`user_id`, `clinic_id`→Clinic, name, role[owner_doctor|front_desk|physiotherapist|pharmacist|admin], `nmc_reg_no` [doctors], phone, `active_flag`) — drives RBAC (F-23).
- **Patient** (`patient_id`, `clinic_id`, name, phone, gender, dob/age, address, `abha_number` [opt], `consent_status`, `consent_recorded_at`, `whatsapp_optin_flag`, audit, `soft_delete_flag`).
- **Appointment** (`appt_id`, `clinic_id`, `patient_id`, `provider_user_id`, `service_type`[consult|physio|xray|followup], `scheduled_start/end`, status[booked|confirmed|checked_in|in_progress|completed|cancelled|no_show|rescheduled], source[phone|walk_in|whatsapp_link], `token_no`, `reminder_sent_flags`).
- **Visit/Encounter** (`visit_id`, `clinic_id`, `patient_id`, `appt_id`, `provider_user_id`, date, complaint, exam fields, diagnosis_notes, plan, `next_return_interval`, `encounter_type`[first|follow_up]).
- **Injury** (`injury_id`, `visit_id`, site/region, laterality[L|R], mechanism, `encounter_type`[initial|subsequent], status) — F-06; imaging & treatment link here.
- **Prescription** (`rx_id`, `visit_id`, `doctor_user_id` [carries `nmc_reg_no`], created_at) with **RxLine** (`rx_line_id`, `rx_id`, generic_name, brand_name[opt], dose, frequency, duration, `schedule_flag`[none|H|H1]).
- **ImagingOrder** (`order_id`, `clinic_id`, `patient_id`, `visit_id`, region, view, side, status) and **ImagingStudy** (`study_id`, `order_id`, `patient_id`, study_date, `report_status`[pending|ready|shared], `report_text`, machine_model, kvp, mas, `report_file_ref`, shared_at) with **ImageFile** (`file_id`, `study_id`, file_ref, type[jpeg|pdf|png|dicom]) — F-09/F-10/F-12.
- **PhysioAssessment** (`assessment_id`, `patient_id`, date, `pain_score`, ROM per-joint (child rows), `functional_scale_type`[LEFS|PSFS|ODI], `functional_score`, plan) — F-13/F-14 (repeatable for re-assessment).
- **PhysioPackage** (`package_id`, `clinic_id`, `patient_id`, name, total_sessions, sessions_used, price, purchase_date, expiry_date, `renewal_due_flag`) with **PhysioSession** (`session_id`, `package_id`, `therapist_user_id`, `appt_id`, date, attended_flag, progress_note, `hep_id`) — F-15/F-16.
- **HomeExerciseProgram** (`hep_id`, `patient_id`, exercises (child rows: name, instructions, sets/reps), shared_at) — F-17.
- **Invoice** (`invoice_id`, `clinic_id`, `patient_id`, `visit_id`[nullable], date, subtotal, tax_total, grand_total, amount_paid, balance_due, status[paid|partial|unpaid]) with **InvoiceLine** (`line_id`, `invoice_id`, item_type[consult|procedure|physio|xray|pharmacy|other], description, qty, unit_price, `gst_exempt_flag`, hsn_code, gst_rate, line_total).
- **Payment** (`payment_id`, `invoice_id`, amount, mode[cash|upi|card], paid_at, `collected_by_user_id`) — many per invoice; feeds day-end reconciliation (F-20) & dues (F-19).
- **Communication/ReminderLog** (`comm_id`, `clinic_id`, `patient_id`, `appt_id`[nullable], channel[whatsapp|sms], type[confirm|reminder|report_share|recall|dues], status, sent_at, read_at) — F-21.
- **AuditLog** (`audit_id`, `clinic_id`, `user_id`, entity, entity_id, action, timestamp) — DPDP access logging (F-24).
- **MigrationBatch** (`batch_id`, `clinic_id`, source, rows_imported, status) — F-25.

**Pharmacy entities (only when `pharmacy_module_enabled_flag`):**
- **Medicine** (`med_id`, `clinic_id`, name, `schedule_flag`[none|H|H1], hsn_code, gst_rate, [batch/expiry/stock deferred to F-30]).
- **PharmacySale** (`sale_id`, `clinic_id`, `patient_id`, `linked_rx_id`, `invoice_id`, `pharmacist_user_id`, date) → **ScheduleH1Register** derived from H1-flagged sales (8 mandatory fields incl. batch no., retained 3y, tamper-proof).

---

## 12. Non-functional requirements

- **Performance:** patient search returns <3s; queue and registration usable at peak on a mid-range Android tablet.
- **Mobile/tablet-first:** all core flows (queue, registration, billing, physio) fully usable on a 7–10in Android screen; large touch targets.
- **Availability / offline stance:** MVP may ship **cloud-only** *if* the target clinics confirm reliable connectivity (see §21). Design the data model and sync boundaries so an **offline-tolerant** mode can follow — offline is a real buying criterion (Clinicea/PappyJoe use it as a wedge). Do **not** architect anything that hard-blocks a later offline layer.
- **Security & privacy (DPDP baseline):** encryption at rest and in transit; role-based access; access/audit logging; explicit recorded consent; soft-delete + archive (never hard delete); basic breach-response capability.
- **Backup & data portability:** on-demand backup + one-click export (F-26) — surfaced proactively to kill lock-in/data-loss fears.
- **Localization:** English for the first demo; architect labels/message templates for **Kannada/Hindi** (validate need — §21).
- **Multi-tenancy:** strict `clinic_id` isolation on every query; a clinic can never see another's data.
- **Auditability & retention:** configurable record-retention policy (default to safer/longer values; flag medico-legal cases for indefinite retention).

---

## 13. Regulatory & compliance requirements

Grouped by obligation level. **All items are point-in-time; confirm against primary/legal sources before any external "compliant" claim.**

### MUST respect in the MVP (from day one)
- **DPDP Act 2023 + Rules 2025.** Patient health data is high-risk personal data. Capture explicit, informed, specific, revocable, **recorded** consent; show a plain-language notice; data minimization; support access/correction/erasure; never make non-treatment processing a condition of care. Build encryption, RBAC, access/audit logging, breach-response. (Penalty ceilings cited up to ₹250 cr / ₹200 cr; breach-notification duties — *from secondary summaries, verify*.) *Source:* `https://ring2doc.com/blog/dpdp-act-compliance-for-clinics`
- **AERB X-ray licensing** (Atomic Energy (Radiation Protection) Rules 2004, eLORA). The app doesn't grant the licence but must store/track licence no., validity/renewal, RSO & operator details, and X-ray usage logs — a genuine compliance selling point. *Source:* `https://medicaldeviceregistration.com/blog/aerb-certificate/`
- **NMC prescription norms (2023).** Default drug entry to **generic name** (brand secondary), print the doctor's NMC/EMRB registration number on every prescription and receipt, legible printed/e-prescriptions. (Enforcement has seen flux — treat generic-name as strongly advisable.) *Source:* `https://medicaldialogues.in/health-news/nmc/how-to-write-a-prescription-check-out-nmcs-prescription-guidelines-for-doctors-115831`
- **GST handling.** Core healthcare services (consultation, procedure, diagnostics/X-ray, physiotherapy-as-treatment) are **exempt**; retail pharmacy/OTC medicine sales are **taxable** (mostly 5% post-Sept 2025) when the clinic is registered. Make GST-registration a config flag; separate exempt vs taxable lines on the invoice; verify per-drug HSN rates at billing time. *Source:* `https://cleartax.in/s/gst-impact-on-healthcare-pharma-sector`

### MUST respect ONLY IF the pharmacy module is enabled
- Retail drug licence + registered pharmacist are the owner's obligation. The module must record prescriber details, link each sale to a prescription, flag Schedule H/H1, maintain the separate **Schedule H1 8-field register** (retained ≥3 years, tamper-proof), and not dispense H/H1 without a linked prescription record. *Source:* `https://shelflifepro.in/blog/schedule-h1-drug-register-compliance-guide/`

### DEFER (structure for; don't block MVP)
- **ABDM/ABHA/HPR/HFR** is voluntary for private clinics — make ABHA an optional patient field and structure records for later linkage; don't pursue live M1/M2/M3 certification now. *Source:* `https://www.nexopd.com/blog/what-is-abha-clinic-integration-india`
- **Karnataka KPME Act 2007 / Rules 2009** governs clinic registration & record-keeping — store the KPME registration no./validity and keep structured records; registration is the owner's duty. Specific KPME retention durations were not verifiable — fall back to widely-cited MCI/DGHS norms (inpatient 3y, OPD 5y, medico-legal 10y / until case disposal) and make retention **configurable**. *Sources:* `https://kpme.karnataka.gov.in/`, `https://drarvindersingh.com/medical-record-retention-rules-in-india/`

---

## 14. WhatsApp integration reality & plan

**WhatsApp is the highest-value and least-de-risked feature — build and prove it FIRST.**

Reality of the WhatsApp Business Platform (Cloud API):
1. **No free-form business-initiated messages.** Reminders/confirmations must be pre-approved **template** messages in the **UTILITY** category (appointment reminders qualify as utility, not marketing).
2. **Direct Cloud API or a BSP.** A **BSP (Business Solution Provider)** is the pragmatic path — India options include AiSensy, Interakt, Wati, Gupshup, Zoko — handling onboarding, template submission, number verification, retries.
3. **Opt-in is mandatory.** Collect the patient's consent to receive WhatsApp before messaging; capture it at registration (ties into DPDP consent, F-24).
4. **24-hour session window.** Once a patient messages you, you can send free-form replies for 24 hours (e.g., share an X-ray, answer a query); outside that window use a template.
5. **Cost is per-message and point-in-time.** Meta prices by category (utility/marketing/authentication); rates & rules change — **verify current pricing with the chosen BSP before quoting ROI.**
6. **TOS risk.** Sending to non-opted-in patients or as non-template messages can get the business number **blocked** — a real risk to the core feature.

**Pragmatic MVP path:**
- Pick one India BSP; register/verify a dedicated clinic WhatsApp number.
- Pre-submit 3–4 utility templates: booking confirmation, 24h reminder, 2h reminder, report/Rx share.
- Capture opt-in at registration with **SMS fallback** for non-opted-in patients.
- Send reminders as templates; use the 24h session window for report sharing & reschedule replies; log delivery/read status.
- **Prove this end-to-end on the founder's own phone before building anything else** — a mocked reminder will not survive a real sell.

### 14.1 Recommended BSP & cost basis

**Cheapest path to prove it: AiSensy** — the only mainstream India BSP with a permanent free-tier subscription, native INR billing and fast activation, so the pilot's subscription cost is ₹0 and you pay only per message. Alternatives cost more for a pilot (Interakt ~₹2,100/mo, Wati ~₹2,499/mo, Gupshup quote-only); Meta's Cloud API direct is marginally cheaper but adds all the number-verification/template/onboarding work a BSP removes — not worth it for a proof.

**Cost basis (point-in-time, Sept 2026 — re-verify with the chosen BSP before any external ROI claim):** utility-template messages run ~**₹0.12–0.15** (Meta India base) + BSP markup + 18% GST ≈ **₹0.20 all-in per message**. Platform fee **₹0** on the free tier (budget ₹999–1,500/mo only if volume forces a paid plan). ⚠️ **Meta change effective 1 Oct 2026:** utility messages sent *inside* the 24h service window begin being charged (were previously free) — this nudges report/Rx-sharing cost up slightly but does **not** affect the reminder model below, since appointment reminders are business-initiated templates that were always paid.

### 14.2 Per-clinic cost & ROI (static model)

**Assumptions:** 3 utility messages/patient (confirmation + 24h + 2h reminder); ₹0.20 all-in per message; 26 working days/month; ₹0 platform fee; **20%** no-show rate; **₹300** revenue per visit (consult only — deliberately conservative); reminders win back **30%** of no-shows (kept below the vendor-claimed 40–60%, which §5 flags as unverified).

| Patients/day | WhatsApp cost/mo | Today's no-show loss/mo | Revenue recovered/mo (30%) | Net gain/mo | ROI |
|---|---|---|---|---|---|
| 100 | ₹1,560 | ₹1,56,000 | ₹46,800 | ₹45,240 | ≈30× |
| 125 | ₹1,950 | ₹1,95,000 | ₹58,500 | ₹56,550 | ≈30× |
| 150 | ₹2,340 | ₹2,34,000 | ₹70,200 | ₹67,860 | ≈30× |

Daily cost is ₹60–90 and **≈₹0.60 per patient** — constant across volumes. ROI holds at **~30×** because both cost and recovery scale with patient count, so the pitch is volume-independent. Two levers move it sharply upward: **revenue per visit** (a visit with X-ray/physio is worth ₹800+, not ₹300 → recovery ~2.7× higher) and the **recovery rate** (30% is conservative). An interactive, drag-the-slider, printable version lives in `OrthoCare-WhatsApp-ROI-Calculator.html`.

### 14.3 Handling the "but the phone is free" objection

The owner's instinct is *"patients call us and we book them — why pay for this?"* The reframe, in order:
- **The phone books; it doesn't remind.** Reminders are the only thing that recovers the ~1-in-5 no-shows — net-new revenue the phone cannot produce. This isn't paying to replace booking; it's paying to plug a leak.
- **"Free" isn't free.** Phone booking already costs a tied-up receptionist and unanswered/busy lines at peak (PP-09/PP-10) — an invisible cost, not a zero cost.
- **The numbers dwarf the fee.** ~₹60–90/day of messages against a ~₹1.5–2.3 lakh/month no-show bleed; one recovered no-show covers ~4 days of messaging.
- **De-risk the close.** Run it 30 days on the free BSP tier, then show the recovered-no-show count in the owner dashboard (F-22) — let the clinic's own data make the argument.

*All figures above are point-in-time (Sept 2026), conservative, and traceable to §5 (no-show range/value) and §14 (message rates). Re-verify BSP pricing before any external claim.*

---

## 15. Onboarding & data-migration plan

Treat paper→digital as **real day-1 work**, not a footnote (PP-15; feature F-25). Three layers so a solo founder isn't buried in data entry:

1. **Bulk import** — provide a CSV/Excel template; if the clinic has any digital list (even a phone-contact export or spreadsheet), import patients (name, phone, age/sex) in one pass. *Effort: S when a list exists.*
2. **Quick-add + progressive capture** — for pure-paper clinics, do **not** back-enter years of files. Load only the active patient register (name+phone) via a <20s/patient quick-add, then capture full history on each patient's **next visit** through the normal consult flow. This spreads effort across weeks and makes the system useful on day one. *Effort: M, mostly front-desk time.*
3. **Founder-assisted setup** — pre-load clinic identity, providers+NMC numbers, service/price list, physio package definitions, and (if pharmacy) the drug master; doubles as the seeded demo pack (F-27). *Effort: S–M.*

**Day-1 sequence:** create clinic + GST/AERB config → add staff+roles (F-23) → import/quick-add active patients (F-25) → load price list & physio packages → approve WhatsApp opt-in template & send a test reminder (F-21) → run one live patient end-to-end.

A realistic first clinic is a **1–2 day setup**, not weeks — because history is captured going forward, not retro-typed. Reassure with one-click export/backup (F-26) up front to kill lock-in/data-loss fear.

---

## 16. Pricing & go-to-market

**Model:** FLAT, TRANSPARENT, PER-CLINIC monthly subscription — **no per-appointment fee, no marketplace commission, no forced patient marketplace**, and no per-user charge beyond a small included seat count. This is the deliberate wedge against Practo (hidden ₹1,500–3,000/mo commissions + lock-in) and enterprise quote-only tools.

**Benchmarks to sit inside:** small-clinic software ~₹2,000–10,000/mo; affordable anchors Halemind (₹999/2,499/4,999) and Clinicea (~₹1,999).

**Suggested tier shape (validate with real WTP — see §21):**
- **Starter ~₹1,499–2,499/mo** — single doctor: queue+booking, records, billing+day-end, WhatsApp reminders, X-ray photo log; ~3 seats.
- **Standard ~₹3,999–4,999/mo** — adds multi-therapist physio (packages+assessment), owner dashboard, referral letters, dues ledger; more seats.
- **Pharmacy add-on ~₹500–1,000/mo** — toggled on only for clinics that run one.
- **Annual-billing discount** + **free founder-assisted setup/migration** to beat switching inertia.

**Conservative ROI framing (do NOT use vendor "40–60% no-show" claims):** anchor on arithmetic the doctor can check — *"at ~40 bookings/week and even a 20% no-show rate, recovering just 2–3 no-shows/month at your consult fee more than covers the subscription."* Add recovered lapsed physio packages and eliminated billing leakage. **Every competitor price cited is a point-in-time estimate — re-verify before putting numbers in sales material.**

---

## 17. Recommended technical approach

> **Decision needed at build kickoff (#1 open item):** confirm the stack. Recommendation below; happy to build either.

### Recommended: Oracle APEX on Oracle Cloud Free Tier
**Why this fits best for *this* project and *you*:**
- **Your expertise.** You build on Oracle APEX daily at SafePaaS — this is your fastest path to a working app.
- **This app is 80% CRUD + forms + reports + dashboards** (patients, visits, billing, queue, packages) — APEX's sweet spot.
- **Free public hosting for the demo:** Oracle Cloud **Always Free** (Autonomous Database + APEX) gives a genuinely free, always-on URL you can demo and even run first clinics on. `apex.oracle.com` is an alternative for quick throwaway demos.
- **Built-in:** authentication + RBAC (maps to F-23), Interactive Reports/Grids, responsive **Universal Theme** (works on Android tablets), and **PDF printing** (prescriptions/receipts, F-07/F-18).
- **Integrations in PL/SQL:** call the WhatsApp BSP REST API via `APEX_WEB_SERVICE`; expose reschedule/webhook endpoints via **ORDS**.
- **Multi-tenancy:** `clinic_id` on every table + a consistent security predicate (or VPD) for isolation.

**Honest trade-offs:**
- Default APEX styling can read "enterprise" — budget **2–3 theming iterations** to make it look modern/consumer-friendly for a sales demo (this is a known pattern with generated APEX pages).
- If you later want a polished, productized multi-tenant SaaS with a marketing site and consumer-grade UI, a modern web stack may present better.

### Alternative: modern web stack
- **Next.js (React) + Postgres (Supabase or Neon) + Tailwind/shadcn UI**, hosted on Vercel/Render.
- Pros: consumer-grade UI polish, easy public hosting, large component ecosystem, straightforward WhatsApp/BSP + file-upload integration.
- Cons: more from-scratch build (auth, RBAC, reports, PDF) than APEX gives out of the box; less leverage of your existing skills.

**My recommendation:** **Build the demo on Oracle APEX + Oracle Cloud Free Tier** for speed, zero hosting cost, and your expertise — accept a couple of theming passes for polish. Re-evaluate the modern stack only if the demo's look-and-feel becomes the blocker to closing.

*(Note: this is a personal side project, distinct from the SafePaaS product; keep it in its own Oracle Cloud tenancy / repo.)*

---

## 18. Suggested build plan / phasing

- **Phase 0 — De-risk WhatsApp (do first).** Stand up the BSP account, verify a number, get 3–4 utility templates approved, send a real reminder to your own phone. Nothing else is worth building until this works. *(F-21 spike)*
- **Phase 1 — Demoable Core Cut (§8.3).** Queue+booking (F-01/F-02), WhatsApp reminders (F-21), patient search + Rx PDF (F-04/F-07), billing + day-end (F-18/F-20), physio package auto-decrement + renewal alert (F-15), X-ray photo capture + share (F-10/F-11). Plus prerequisites: seeded demo data (F-27), migration/quick-add (F-25), RBAC (F-23), DPDP schema + soft-delete (F-24), mobile-first UI (F-28). **→ This is the sellable demo.**
- **Phase 2 — Depth after first sale.** Ortho notes + injury record (F-05/F-06), physio assessment/re-assessment/HEP (F-13/F-14/F-16/F-17), imaging order + AERB register (F-09/F-12), dues ledger (F-19), owner dashboard (F-22), reschedule link (F-03), referral letter (F-08), export/backup (F-26).
- **Phase 3 — Optional pharmacy + hardening.** Pharmacy dispense + H1 register (F-29), then full inventory/FEFO (F-30); offline-tolerant mode; localization; ABHA structuring.

---

## 19. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **Evidence risk** — pain points partly from paraphrased summaries; Chaudhary may be closed | Manual review pull + confirm both clinics are live before pitching (§21) |
| **WhatsApp API risk** — template approval, opt-in, 24h window, BSP cost, number-block on TOS breach | Phase 0 spike; templates only; opt-in at registration; SMS fallback |
| **Regulatory-claim risk** — DPDP/GST/retention figures from secondary sources | Legal review before any "compliant" claim; keep claims factual/conservative |
| **Data-migration risk** — "free migration" can bury a solo founder | Progressive capture (history on next visit), not full back-entry (§15) |
| **Adoption risk** — low-digital-literacy front desk; possible Kannada/Hindi need | <1-day training; tablet-first; validate language need; localizable labels |
| **Solo-operator hosting/liability** — self-hosting multi-tenant health data means owning uptime, backups, breach response | Use managed Oracle Cloud; backups + audit from day one; consider per-clinic instances |
| **Scope/timeline mismatch** — 8 modules is multi-quarter | Ship the 6-area demo core first; defer the rest |
| **Pricing/WTP risk** — no primary WTP data | Validate price with the first 2–3 clinics before locking tiers |
| **Competitive-figure risk** — prices/no-show claims unverified | Re-verify; use conservative ROI arithmetic in the pitch |
| **Pharmacy-toggle compliance risk** — half-baked H/H1 slice creates customer exposure | Keep pharmacy fully deferred/hidden until built properly |

---

## 20. Demo plan

**Setup:** cheap Android tablet mirrored to a screen, pre-loaded with the **doctor's own clinic identity** (F-27): name, logo, real name + NMC number, realistic local patient names, an ortho day schedule, a physio package, sample bills.

**2-minute script:**
- **0:00 — "This is your clinic, today."** Show the live **QUEUE**: 6 walk-ins with tokens & estimated waits (F-01). Register a new walk-in in ~10s → token issued.
- **0:20 — WhatsApp lands on the doctor's own phone.** Book a follow-up and send a real confirmation + reminder to his handset (F-02/F-21). Pause on the buzz — the visceral "oh."
- **0:40 — 3-second history.** Type a patient's name → full history + last X-ray in <3s (F-04). "This is the file you dig for on paper."
- **0:55 — X-ray, no lost films.** Snap/attach an X-ray photo and one-tap WhatsApp it to the patient (F-10/F-11).
- **1:10 — The paper artifact.** Write a quick Rx → prints a clean PDF on his letterhead with his NMC number (F-07). Hand him the page + a GST-correct receipt (F-18).
- **1:30 — Recovered money.** Physio package auto-decrements to 2 sessions left; renewal-due alert fires (F-15): "that's money that quietly walks out today."
- **1:45 — Nightly tally, gone.** One click: day-end collections by cash/UPI/card reconciling to the drawer (F-20). Close with a one-page conservative ROI sheet and "your data is always yours" (one-click export).

**Demo do's:** demo on the device they own; pre-empt the two fears (export + "works when internet drops"); keep it to the 6 core areas and hide the rest.

---

## 21. Open questions to validate before/at the pitch

1. **Are BOTH named clinics operating?** Confirm Chaudhary/Chowdry is live (one listing says "Closed Down"); re-pull real Google/Practo reviews for OrthoCure in person.
2. **Do the target clinics run an attached pharmacy?** Decides whether the Pharmacy toggle is near-term or rarely used.
3. **Is offline-first a dealbreaker** for these clinics, or is connectivity reliable enough to ship cloud-only for MVP?
4. **Kannada/Hindi UI + WhatsApp templates** — needed for the first demo clinics, or is English enough?
5. **Willingness-to-pay** — what monthly price will these owner-doctors accept, and monthly vs annual?
6. **WhatsApp BSP choice + current per-message costs/category rules** — confirm before any reminder ROI number.
7. **X-ray reality** — do the clinics have a CR/DR console that exports JPEG/PDF, or older plain film only? (Phone-photo path covers both, but validate.)
8. **DPDP Rules 2025** obligations/timelines/penalties — legal confirmation before any "compliant" claim.
9. **Karnataka KPME Rules 2009** record-retention durations & required registers — confirm before hard-coding defaults.
10. **Current per-molecule GST rates** and whether separately-billed physiotherapy is GST-exempt — verify at billing time.
11. **AERB register field schema** — confirm the mandated diagnostic X-ray/exposure log fields against AERB eLORA before finalizing F-12.
12. **Stack decision** (§17) — Oracle APEX on OCI Free Tier (recommended) vs modern web stack.
13. **Hosting model** — single multi-tenant instance vs per-clinic instance for sold clinics.

---

## Appendix A — Sources by research angle

**Named-clinic reviews & patient pain points**
- https://www.mouthshut.com/product-reviews/orthocure-clinic-rt-nagar-bangalore-reviews-926099955
- https://www.justdial.com/Bangalore/Orthocure-Clinic-Near-To-Kfc-Rt-Nagar/080P3027824_BZDET
- https://www.practo.com/bangalore/doctor/dr-gaurav-sharma-orthopedist
- https://www.clinicspots.com/clinic/chowdry-orthopaedic-centre
- https://www.practo.com/bangalore/clinic/vital-skin-klinic-btm-layout-2nd-stage-1/reviews
- https://www.engageoagency.com/blog/how-to-reduce-patient-no-shows-indian-clinics
- https://clinicappointments.com/call-answering/
- https://www.mouthshut.com/product-reviews/specialist-hospital-kalyan-nagar-bangalore-reviews-925860572
- https://www.mouthshut.com/review/cutis-clinic-bangalore-review-putuqmllon
- https://www.justdial.com/Bangalore/Clinics/nct-10101647
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11463868/
- https://thesouthfirst.com/health/this-bengaluru-hospitals-google-review-responses-are-going-viral-and-not-for-the-right-reasons/
- https://www.statista.com/statistics/916701/india-opinion-on-healthcare-system-regarding-waiting-times/

**Staff/owner operations**
- https://healthion.in/blog/our-blog-1/what-is-the-use-of-practice-management-software-in-an-indian-clinic-15
- https://drpro.app/clinic-management/best-clinic-management-software-small-clinics-india-2026/
- https://www.lighttangent.com/knowledge-bank/all-in-one-clinic-application-solo-doctor/
- https://mybillbook.in/blog/how-hospital-track-payments-deposits-dues/
- https://www.easyclinic.io/clinic-cash-flow
- https://physiocarepms.com/blogs/physiotherapy-clinic-management-software-features/
- https://www.physitrack.com/insights/best-physiotherapy-clinic-management-software-india
- https://mocdoc.com/blog/pharmacy-inventory-management-system-stockouts-expiry
- https://www.siliconpractice.in/electronic-medical-records-india/
- https://boringaimanual.substack.com/p/the-physio-clinic-that-keeps-patients

**India regulatory & compliance**
- https://www.nexopd.com/blog/what-is-abha-clinic-integration-india
- https://ring2doc.com/blog/dpdp-act-compliance-for-clinics
- https://www.scrut.io/post/dpdp-rules
- https://amlegals.com/health-data-and-the-dpdp-act-a-practical-guide/
- https://medicaldeviceregistration.com/blog/aerb-certificate/
- https://quantbit.io/products/hisx/schedule-h-drug-compliance-guide
- https://cleartax.in/s/gst-impact-on-healthcare-pharma-sector
- https://medicaldialogues.in/health-news/nmc/how-to-write-a-prescription-check-out-nmcs-prescription-guidelines-for-doctors-115831
- https://kpme.karnataka.gov.in/
- https://drarvindersingh.com/medical-record-retention-rules-in-india/
- https://shelflifepro.in/blog/schedule-h1-drug-register-compliance-guide/
- https://www.medicolegalservices.in/schedule-h-drugs-india-prescription-rules/

**Competitor software & pricing**
- https://www.practo.com/providers/clinics/ray/plans
- https://www.cufront.com/blog/practo-ray-pricing-india-worth-it-2026
- https://blogs.healthplix.com/pricing/
- https://www.techjockey.com/reviews/healthplix
- https://www.docengage.in/pricing
- https://halemind.com/hospital_management_software
- https://www.karexpert.com/hospital-information-management-system/
- https://www.capterra.in/software/161290/mocdoc-hms
- https://www.bajajfinservhealth.in/doctors-emr/campaign/clinic-management-software
- https://clinicea.com/
- https://creliohealth.com/in/
- https://physiocarepms.com/pricing/
- https://pappyjoe.com/products/clinic-management-software/
- https://www.vivalynlabs.com/blog/best-emr-software-small-clinics-india-2026

**Clinical domain workflows (ortho / X-ray / physio / pharmacy)**
- https://www.medicalbillersandcoders.com/article/coding-guidelines-orthopedic-evaluation-and-management.html
- https://omnimd.com/specialties/ehr-orthopedics/
- https://www.aapc.com/blog/38399-fracture-diagnosis-coding-initial-visit-vs-subsequent-visit/
- https://www.heidihealth.com/en-us/templates/generic-referral-letter-custom-f378a033
- https://medicaldialogues.in/news/health/hospital-diagnostics/x-ray-film-shortage-row-kmc-hospital-asks-patients-to-use-mobile-photos-168438
- https://pubmed.ncbi.nlm.nih.gov/35070657/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC3354356/
- https://www.radiantviewer.com/dicom-viewer-manual/export_images.html
- https://www.patientnotes.app/templates/physiotherapy-initial-clinical-notes-template
- https://www.writeupp.com/blog/outcome-measures
- https://physiocarepms.com/features/treatments/
- https://www.noterro.com/disciplines/physiotherapy-clinic-management-software
- https://www.fyond.com/pharmacy-management-software

---

## Appendix B — Assumptions & confidence flags

- **High confidence:** operational pain points (waits, no-shows, paper records, billing/reconciliation, physio drop-off/packages); competitor feature sets; clinical workflow structure (ortho notes, physio scales, X-ray phone-photo ingestion, Schedule H/H1 registers).
- **Medium confidence:** exact star ratings/quotes for the two named clinics (search-summary, not rendered pages); competitor pricing (third-party estimates); DPDP penalties/timelines and NMC enforcement.
- **Low / to-verify:** whether Chaudhary/Chowdry is still operating; primary WTP/pricing acceptance; exact AERB log fields; KPME retention durations; per-molecule GST rates; current WhatsApp BSP per-message costs; whether target clinics need Kannada/Hindi and offline.
- **Domain-inference (not from a specific review):** paper→digital migration as the adoption blocker (PP-15); some data-model field choices.

*End of DRAFT v0.1. Feed this document back to Claude to begin the MVP build — start with §8.3 Demoable Core Cut on the §17 recommended stack, after the §14 WhatsApp Phase-0 spike.*
