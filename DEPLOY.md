# Deploy OrthoCare to Vercel + Postgres (public demo URL)

~10 minutes. Free tier throughout. You'll need **GitHub**, **Vercel**, and **Neon** (Postgres) accounts — all free. The code is already prepped for this; steps that need your accounts are called out.

> Why Neon: free serverless Postgres with built-in connection pooling (which Vercel's serverless functions need). Supabase or Vercel Postgres work too — just paste their URLs.

---

## Step 1 — Create the Postgres database (Neon)

1. Sign up at **https://neon.tech** → create a project (region: pick one near India, e.g. `ap-southeast-1`).
2. In the project's **Connection Details**, copy **two** connection strings:
   - **Pooled** connection — the host contains **`-pooler`**. This is `DATABASE_URL`.
   - **Direct** connection — the host **without** `-pooler`. This is `DIRECT_URL`.
   Both should end with `?sslmode=require`.

## Step 2 — Create tables + load demo data (from your machine)

```bash
cd D:\OrthoCare
# put the two URLs from Step 1 into .env (DATABASE_URL and DIRECT_URL)
npm install
npm run db:deploy   # creates all tables in Neon (prisma db push)
npm run seed        # loads OrthoCure's demo clinic + a day of data
```

Tip: re-run `npm run reset` anytime (e.g. right before a pitch) to wipe and reload fresh demo data.

## Step 3 — Push the code to GitHub

A git repo is already initialized with a first commit. Create an empty GitHub repo (private is fine), then:

```bash
git remote add origin https://github.com/<you>/orthocare.git
git branch -M main
git push -u origin main
```

(Or use the GitHub CLI: `gh repo create orthocare --private --source=. --push`.)

## Step 4 — Import to Vercel

**Option A — Dashboard (easiest):**
1. Go to **https://vercel.com/new** → **Import** your `orthocare` repo.
2. Framework preset: **Next.js** (auto-detected). Leave build/install commands as default — `npm run build` already runs `prisma generate`.
3. Expand **Environment Variables** and add:
   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | your Neon **pooled** URL |
   | `DIRECT_URL` | your Neon **direct** URL |
   | `MESSAGING_PROVIDER` | *(leave unset for the demo)* |
4. Click **Deploy**. In ~1–2 minutes you'll get a public URL like `https://orthocare-<hash>.vercel.app`.

**Option B — Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel                     # link/create the project, first deploy (preview)
vercel env add DATABASE_URL production   # paste pooled URL when prompted
vercel env add DIRECT_URL production     # paste direct URL when prompted
vercel --prod              # promote to the public production URL
```

## Step 5 — Verify

Open the Vercel URL → you should see today's queue with OrthoCure's data (same as local). Log a walk-in, send a WhatsApp (mock), print an Rx — all should work.

---

## Before a live demo
- **Reset data:** `npm run reset` locally (it targets the same Neon DB), so the demo starts clean.
- **Make it their clinic:** open **/settings** on the live site and set the clinic name, doctor + NMC number, logo, GST/AERB — it flows onto the header, prescriptions and receipts.
- **Custom domain (optional):** Vercel → Project → Settings → Domains.

## Notes & limits (demo scope)
- **X-ray images** are stored as base64 data URLs in Postgres (zero-config, works on serverless). For production scale, switch `uploadStudy()` in `src/lib/actions` to **Vercel Blob** or **S3** and store a URL instead.
- **WhatsApp** is still the mock provider until you wire a BSP (set `MESSAGING_PROVIDER=bsp` and implement `BspProvider.send()` in `src/lib/messaging.ts`). See requirements §14.
- **Auth:** the role switcher is demo-only; add real authentication before real patient data goes in.
- **Secrets:** never commit `.env` (it's gitignored). Env vars live in the Vercel dashboard.

## Troubleshooting
- **`P1001 can't reach database`** → check the URL, ensure `?sslmode=require`, and that you used the **pooled** URL for `DATABASE_URL`.
- **Prisma errors on Vercel build** → confirm `prisma` is installed (it is, in devDependencies) and the build command is `npm run build` (runs `prisma generate`).
- **Tables missing on the live site** → you skipped Step 2; run `npm run db:deploy` against the Neon URL.
- **Too many connections** → make sure `DATABASE_URL` is the **`-pooler`** host.
