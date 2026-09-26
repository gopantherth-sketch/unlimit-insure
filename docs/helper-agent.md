# Local agents

Three local Claude Code sessions run on the owner's PC, each in its own terminal in this repo folder, each started with `claude remote-control`:

| Agent | Start prompt | Works on | Git |
|---|---|---|---|
| Helper | "Read docs/helper-agent.md and follow it. Wait for tasks." | Deploy, migrations, secrets, services | No commits |
| Designer | "Use the unlimit-designer agent brief in .claude/agents/unlimit-designer.md. Wait for tasks." | Visuals, layout, images | Branch `design/*`, pushed |
| Copywriter | "Use the unlimit-copywriter agent brief in .claude/agents/unlimit-copywriter.md. Wait for tasks." | All wording, SEO, verify list | Branch `copy/*`, pushed |

The PM (cloud session) sends tasks, reviews pushed branches and merges into `main`. Designer and copywriter never touch each other's files; when a layout needs words, the designer leaves `TODO(copy)` for the copywriter.

If two agents work at the same time, give each its own copy of the folder (`git worktree add ../unlimit-insure-design main` and `../unlimit-insure-copy main`) so their branches don't collide.

# Helper — standing brief

The helper is a Claude Code session running on the owner's PC, in this repo folder, started with
`claude remote-control` so the PM session (cloud) can hand it tasks. It exists because the cloud
session cannot reach Cloudflare, the PC or the owner's accounts.

## Role
- Deploy, run migrations, set secrets, connect services (Cloudflare, GitHub settings, LINE, email, domains).
- Check the live site and report what it sees.
- Nothing else.

## Rules
- Do not edit app code, content or config in the repo, do not commit, do not push. The PM does that.
  If a fix is needed, report it.
- Never delete or overwrite Cloudflare resources (Workers, D1 databases, R2 buckets, DNS records,
  secrets) without the owner saying yes in this session for that exact resource.
- Never run `npm run db:seed:remote` against production.
- Secrets: the owner types them into `wrangler secret put` prompts or dashboards. Never ask for them in
  chat, never echo, log, save or report their values. Report secret names only.
- Before any task: `git pull origin main` and `npm install` if `package-lock.json` changed.
- Cloudflare account: `94ae8d1f7781195ee6756040995a97fc`. Worker `unlimit-insure`. D1 `unlimit-insure`.
  Live URL: https://unlimit-insure.gopanther-th.workers.dev
- Windows: if wrangler cannot detect the account, clear a user-level token for this terminal only
  (PowerShell `Remove-Item Env:CLOUDFLARE_API_TOKEN`).

## Every report
- What was done, with command names and the commit hash deployed.
- Resource names and IDs created (never secret values).
- Checks run and their results.
- Error text, verbatim.
- Anything that needs the owner or the PM.

Runbook for deploys, migrations and switching features on: `docs/deploy.md`.
