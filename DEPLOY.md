# Deploy OrthoCare — public demo URL

**Status:** the **Neon Postgres** database is already set up via the Neon CLI:
- Project **Care4you** (`billowing-cake-48701577`), branch **production**, region `aws-us-east-2`.
- Tables created (`prisma db push`) and demo data loaded (`npm run seed`).
- The app has been verified running against it locally.
- Credentials live in `.env` (auto-populated by `neon link`, gitignored): `DATABASE_URL` (pooled) + `DATABASE_URL_UNPOOLED` (direct).

**What's left for a public URL:** push to GitHub, then deploy on Vercel (both need your accounts).

---

## Step 1 — Push to GitHub

Create an empty GitHub repo, then:

```bash
git remote add origin https://github.com/<you>/orthocare.git
git push -u origin main
```
(or `gh repo create orthocare --private --source=. --push`)

## Step 2 — Deploy on Vercel

1. Go to **https://vercel.com/new** → import the `orthocare` repo (framework auto-detected: Next.js; build command `npm run build` already runs `prisma generate`).
2. Provide the two database env vars. Two ways:
   - **Recommended — Neon–Vercel integration:** in Vercel add the **Neon** integration (or from the Neon Console → Integrations → Vercel) and connect the **Care4you** project. It injects `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically.
   - **Manual:** copy the two values from your local `.env` into Vercel → Project → Settings → Environment Variables (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`).
3. **Deploy.** In ~1–2 min you get a public URL like `https://orthocare-<hash>.vercel.app`.

**Vercel CLI alternative:**
```bash
npm i -g vercel && vercel login
vercel                                   # link + first (preview) deploy
vercel env add DATABASE_URL production            # paste pooled URL
vercel env add DATABASE_URL_UNPOOLED production    # paste direct URL
vercel --prod                            # promote to production URL
```

## Step 3 — Verify
Open the Vercel URL → today's queue with OrthoCure's data should load (same as local).

---

## Managing the demo
- **Reset data before a pitch:** `npm run reset` (targets the Neon DB).
- **Make it their clinic:** open `/settings` on the live site → set clinic name, doctor + NMC number, logo, GST/AERB.
- **Neon connection strings on demand:** `neon connection-string production --pooled` (and without `--pooled` for direct).
- **Re-apply Neon policy:** `neon deploy` (currently a no-op — `neon.ts` is an empty policy; Postgres only).

## Security / cleanup
- `neon mcp` minted a **full-access account API key** (id **3368080**) and wrote it into your local MCP configs (Claude/Cursor/Copilot/VS Code). If you don't want a broad key sitting in those files, revoke it: `neon api-keys revoke 3368080`.
- `.env`, `.neon`, and the Neon skills folder are gitignored — no secrets are committed.

## Notes & limits (demo scope)
- **X-ray images** are stored as base64 data URLs in Postgres (works on serverless; use Vercel Blob/S3 at scale).
- **WhatsApp** is the mock provider until a BSP is wired (`MESSAGING_PROVIDER=bsp` + implement `BspProvider.send()` in `src/lib/messaging.ts`). See requirements §14.
- **Auth:** the role switcher is demo-only — add real authentication before real patient data.
- **Pooling:** the app uses the pooled `DATABASE_URL` at runtime; `prisma db push`/migrations use `DATABASE_URL_UNPOOLED`.

## Troubleshooting
- **`P1001 can't reach database`** → check the URL and that `DATABASE_URL` is the `-pooler` host with `?sslmode=require`.
- **Prisma errors on Vercel build** → build command must be `npm run build` (runs `prisma generate`); `prisma` is in devDependencies (installed during build).
- **Tables missing** → run `npm run db:deploy` against the Neon URL.
