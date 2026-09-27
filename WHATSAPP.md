# WhatsApp (Meta Cloud API) — setup & go-live

The app is coded to send real WhatsApp **template** messages via the **Meta WhatsApp Business Cloud API**. Until you complete the steps below it runs in **mock mode** (simulated sends, so the demo still works). Nothing here is committed as a secret — credentials go in `.env` (local) and Vercel env vars.

> Why templates: business-**initiated** WhatsApp messages (our reminders/confirmations) must be **pre-approved templates**. Free-form text is only allowed inside a 24-hour window after the patient messages you. So each message type maps to a template + ordered parameters (in `src/lib/messaging.ts`).

---

## 1. One-time Meta setup

1. Create a **Meta Business** account and verify it: https://business.facebook.com
2. In **developers.facebook.com** → create an app → add the **WhatsApp** product.
3. Add and verify a **phone number** for WhatsApp (a number not already on WhatsApp), or use the test number to start.
4. Note your **Phone Number ID** (WhatsApp → API Setup) → this is `WHATSAPP_PHONE_NUMBER_ID`.
5. Create a **permanent access token** (System User in Business Settings → assign the app → generate token with `whatsapp_business_messaging` + `whatsapp_business_management`) → this is `WHATSAPP_TOKEN`. (The temporary 24h token works for testing.)

## 2. Create the templates

In **WhatsApp Manager → Message Templates**, create these (category **Utility**, language **English `en`**). The body text must use `{{1}}, {{2}}, …` in the exact order listed — the app fills them in this order.

| Template name | Params (in order) | Suggested body |
|---|---|---|
| `appt_confirmation` | 1 name, 2 doctor, 3 clinic, 4 when, 5 token | `Hello {{1}}, your appointment with {{2}} at {{3}} is confirmed for {{4}}. Token: {{5}}. Reply to reschedule.` |
| `appt_reminder_24h` | 1 name, 2 doctor, 3 clinic, 4 when | `Reminder: {{1}}, you have an appointment with {{2}} at {{3}} on {{4}}. Reply CANCEL or RESCHEDULE if you can't make it.` |
| `appt_reminder_2h` | 1 name, 2 doctor, 3 clinic, 4 when, 5 token | `See you soon, {{1}}! Your appointment with {{2}} at {{3}} is at {{4}}. Your token is {{5}}.` |
| `report_ready` | 1 name, 2 report, 3 clinic | `Hello {{1}}, your {{2}} from {{3}} is ready. Please keep it for your records.` |
| `followup_recall` | 1 name, 2 doctor, 3 clinic | `Hi {{1}}, it's time for your follow-up with {{2}} at {{3}}. Reply to book a slot.` |
| `payment_reminder` | 1 name, 2 amount, 3 clinic | `Hello {{1}}, a gentle reminder of an outstanding balance of {{2}} at {{3}}. You can pay by UPI at the clinic. Thank you.` |

If you name templates differently, set the `WA_TPL_*` env overrides (see `.env.example`). If you use a non-English language, set `WHATSAPP_TEMPLATE_LANG` to that code and translate the templates. Wait for each template's status to become **Approved** (minutes–hours) before sending.

## 3. Set env vars

Local `.env` and **Vercel → Settings → Environment Variables (Production)**:

```
MESSAGING_PROVIDER=meta
WHATSAPP_PHONE_NUMBER_ID=<your phone number id>
WHATSAPP_TOKEN=<your permanent token>
WHATSAPP_API_VERSION=v21.0        # optional
WHATSAPP_TEMPLATE_LANG=en          # optional
```
Redeploy Vercel after adding them (env vars only apply to new deployments).

## 4. Test

- Locally: set the vars in `.env`, `npm run dev`, then in the app send a message (e.g. Queue → **Remind**, or `/messages` → Send) to a number that has messaged your business number or is a permitted test recipient.
- A real send returns status **SENT** (Meta accepts it) and a provider message id. Delivered/Read require webhooks (not implemented — see below).

## 5. Notes, limits & next steps

- **Opt-in:** the app only sends to patients with `whatsappOptIn = true` (captured at registration). Keep it that way — messaging non-opted-in users risks the number being blocked.
- **Status = SENT only:** we don't yet consume Meta **webhooks**, so we can't show Delivered/Read for real sends (mock mode shows Delivered/Read). Adding a webhook route (`/api/whatsapp/webhook`) to update message status is a good follow-up.
- **Report sharing is text-only:** `report_ready` notifies the patient; it does **not** attach the X-ray image (images are stored as data URLs, not public URLs). To actually deliver the image, host it (Vercel Blob/S3) and use a media template or send a link within the 24h window.
- **Phone format:** numbers are normalized to digits with country code (e.g. `+91 98861 20001` → `919886120001`). Ensure patient numbers include the country code.
- **Cost:** Meta bills per conversation by category; utility templates are low-cost and some are free within a service window. Verify current pricing before quoting ROI.
