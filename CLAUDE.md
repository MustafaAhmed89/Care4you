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

## Parallel sessions — worktree isolation

When more than one session may run on this repo at once, **each session works in its own
git worktree** so uncommitted changes from different tasks never pile into one shared tree
on `main`. (That already bit us once: an unrelated feature's `git add` swept up another
session's doc edits into its commit.)

**Start any feature/fix/enhancement in a worktree:**
1. Call **`EnterWorktree`** (app tool). It creates `.claude/worktrees/<name>` on a new
   `claude/<name>` branch **from `origin/main`** and switches this session into it — which
   also satisfies the "never work on `main`" rule automatically (you start on a fresh branch).
2. From the worktree, run **`scripts/bootstrap-worktree.ps1`**. A fresh worktree has no
   `.env` / `.neon` / `node_modules` (all gitignored), so this copies the secrets from the
   primary worktree and runs `npm install`.
3. Work → commit → push the branch → open a PR → merge (the Git workflow above).
4. When done, **`ExitWorktree`** — `keep` to resume later, `remove` to delete it — or let
   the app prompt you to keep/remove at session exit.

Skip the worktree only for tiny read-only or docs-only tasks when no other session is active.

**⚠️ Shared-database caveat:** a worktree isolates the *filesystem and git*, NOT the
database — every worktree's `.env` points at the **same Neon `production` branch**. So
parallel `prisma db push` or `npm run reset` will clobber each other. For true isolation,
give each worktree its own Neon branch and point its `.env` `DATABASE_URL` at it (Neon
supports instant branches); not wired up yet — ask if you want it.

**Notes:** the dev server auto-picks a free port (`autoPort` in `.claude/launch.json`), so
parallel previews don't collide. Worktree location (`.claude/worktrees`) is set in
Settings → Claude Code; new worktrees branch from `origin/main` (`worktree.baseRef: fresh`
in `.claude/settings.json`).

## Other project notes
- `.env` is gitignored (real Neon credentials) — never commit it.
- More conventions, gotchas, and the backlog live in [`JOURNAL.md`](JOURNAL.md);
  read it at the start of a session.
- **Keep the docs current in the same PR as the feature.** When you build or change
  a feature: (1) add a session-log entry + update the backlog in [`JOURNAL.md`](JOURNAL.md),
  and (2) add/refresh its demo use case + the status table in [`DEMO.md`](DEMO.md)
  (the living demo use-case catalog) and bump its "Last updated" date.
