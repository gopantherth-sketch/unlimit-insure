# One-time setup for the three local agents (core, designer, copywriter) on Windows. See docs/agents.md.
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File scripts\setup-local-agents.ps1
# Safe to run again: existing folders are reused, and it only opens the agent windows.
$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$parent = Split-Path $root -Parent
$design = Join-Path $parent "unlimit-insure-design"
$copy = Join-Path $parent "unlimit-insure-copy"

foreach ($tool in "git", "npm", "claude") {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "$tool is not installed or not on PATH." }
}

Write-Host "== Core folder: $root"
Set-Location $root
git pull origin main
npm install

git fetch origin
foreach ($dir in $design, $copy) {
  if (-not (Test-Path $dir)) {
    Write-Host "== Creating $dir"
    # Detached at origin/main: main stays checked out in the core folder; agents branch from here.
    git worktree add --detach $dir origin/main
  }
  Write-Host "== Installing in $dir"
  Push-Location $dir
  npm install
  if ((Test-Path (Join-Path $root ".dev.vars")) -and -not (Test-Path ".dev.vars")) { Copy-Item (Join-Path $root ".dev.vars") ".dev.vars" }
  Pop-Location
}

$agents = @(
  @{ Name = "Unlimit core";       Dir = $root;   Prompt = "Use the unlimit-core agent brief in .claude/agents/unlimit-core.md. Read HANDOVER.md and docs/progress.md, then tell me the top 3 next steps." },
  @{ Name = "Unlimit designer";   Dir = $design; Prompt = "Use the unlimit-designer agent brief in .claude/agents/unlimit-designer.md. Wait for tasks." },
  @{ Name = "Unlimit copywriter"; Dir = $copy;   Prompt = "Use the unlimit-copywriter agent brief in .claude/agents/unlimit-copywriter.md. Wait for tasks." }
)
foreach ($a in $agents) {
  $cmd = "`$Host.UI.RawUI.WindowTitle = '$($a.Name)'; Set-Location '$($a.Dir)'; Write-Host 'First message to send:' -ForegroundColor Cyan; Write-Host '$($a.Prompt)' -ForegroundColor Yellow; claude remote-control"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
}

Write-Host ""
Write-Host "Done. Three windows opened. In each Claude session, send the yellow first message shown in its window." -ForegroundColor Green
Write-Host "Keep the windows open while working; run this script again to reopen them." -ForegroundColor Green
