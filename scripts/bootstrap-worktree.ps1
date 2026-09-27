<#
  bootstrap-worktree.ps1 - make a fresh git worktree runnable.

  A worktree created by EnterWorktree (or 'git worktree add') is a clean checkout of
  origin/main. It does NOT contain the gitignored files the app needs to run:
  .env / .neon (secrets) or node_modules. Run this from inside the new worktree once,
  right after entering it. Safe to re-run.

  Usage (from the worktree root):
    powershell -File <repo>/scripts/bootstrap-worktree.ps1
    powershell -File <repo>/scripts/bootstrap-worktree.ps1 -SkipInstall   (env files only)
#>
param([switch]$SkipInstall)
$ErrorActionPreference = 'Stop'

# Resolve this worktree's root and the primary worktree's root (which holds the secrets).
$wt        = ((& git rev-parse --show-toplevel).Trim()) -replace '\\', '/'
$commonGit = ((& git rev-parse --path-format=absolute --git-common-dir).Trim()) -replace '\\', '/'
$main      = (Split-Path $commonGit -Parent) -replace '\\', '/'

if ($wt -eq $main) {
  Write-Host "You are in the primary worktree ($main) - nothing to bootstrap."
  exit 0
}

Write-Host "Primary worktree : $main"
Write-Host "This worktree    : $wt"

# Copy the gitignored env/secret files across (only those that exist in the primary).
foreach ($f in @('.env', '.neon', '.env.local', '.env.development.local')) {
  $src = Join-Path $main $f
  if (Test-Path $src) {
    Copy-Item -Path $src -Destination (Join-Path $wt $f) -Force
    Write-Host "  copied $f"
  }
}

if ($SkipInstall) {
  Write-Host "Skipped npm install (-SkipInstall). Run 'npm install' before starting the app."
  exit 0
}

Write-Host "Installing dependencies (npm install, which also runs prisma generate)..."
& npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed (exit $LASTEXITCODE)" }

Write-Host ""
Write-Host "Worktree ready."
Write-Host "  - Dev server auto-picks a free port (autoPort in .claude/launch.json)."
Write-Host "  - This worktree shares the SAME Neon database as every other worktree."
Write-Host "    Avoid 'npm run reset' or schema pushes unless you intend to affect all sessions"
Write-Host "    (see CLAUDE.md, Parallel sessions, for per-branch DB isolation)."
