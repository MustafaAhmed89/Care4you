# CLAUDE.md — OrthoCare (project instructions)

Repo-specific rules for the OrthoCare clinic-management MVP. General preferences and
who I am live in the global `~/.claude/CLAUDE.md`. Full project context is in
[`JOURNAL.md`](JOURNAL.md) and the PRD (`OrthoCare-Clinic-MVP-Requirements.md`).

## What this is
A demoable, WhatsApp-first clinic-management web app for small owner-run ortho +
physio clinics in Bengaluru. Stack: **Next.js 14 (App Router) + Prisma + Postgres
(Neon)**, deployed on **Vercel**. Live: https://care4you.vercel.app/ · Repo:
`MustafaAhmed89/Care4you`. `main` auto-deploys to production.

## Git workflow — always branch; never commit to `main` directly

**Validation step — run this BEFORE starting or committing ANY feature, fix, or
enhancement:** check the current branch with `git branch --show-current`. If it is
`main`, STOP and create a branch first — do not make the change on `main`.

1. **Branch first.** Before writing code: `git switch -c <type>/<short-slug>`
   (`git checkout -b` is equivalent). Types: `feat/` (feature), `fix/` (bug fix),
   `chore/` (tooling, docs, config). E.g. `fix/mobile-queue-layout`, `feat/whatsapp-bsp`.
2. **Commit on that branch**, not on `main`.
3. **Push the branch** and **open a PR to `main`** (`gh pr create` — the `gh` CLI is
   authed as MustafaAhmed89). Each PR also gets its own Vercel preview URL to verify on.
4. **Merge the PR into `main`** to ship — merging is what triggers the production
   deploy. Confirm with me before merging unless I've said to just ship it.

Never push feature/fix commits straight to `main`. If you notice you're on `main`
with uncommitted work, create the branch first (`git switch -c ...`) — the changes
move with you — then commit there.

## Other project notes
- `.env` is gitignored (real Neon credentials) — never commit it.
- More conventions, gotchas, and the backlog live in [`JOURNAL.md`](JOURNAL.md);
  read it at the start of a session.
