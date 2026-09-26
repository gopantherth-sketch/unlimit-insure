# Unlimit Insure

Thai motor-insurance decision and ownership platform. Next.js 15 on Cloudflare Workers (OpenNext) + D1 + Drizzle.

Start here: `HANDOVER.md` (state, decisions, map), then `docs/progress.md` (status) and `docs/agents.md` (team split and backlog).

Team (each runs in its own folder or worktree):
- **Core:** `.claude/agents/unlimit-core.md`. Code, data, deploys, merges `main`.
- **Designer:** `.claude/agents/unlimit-designer.md`. Visuals only, branch `design/*`.
- **Copywriter:** `.claude/agents/unlimit-copywriter.md`. Words only, branch `copy/*`.

Always:
- Thai copy lives in `content/**`.
- No fake reviews, stats or insurer logos, and no invented contact or licence details (`[รอข้อมูล]`).
- Secrets are never in chat or commits. Never commit personal data or ID documents.
- Online purchase stays off (`PURCHASE_ENABLED=false`) until the owner decides.
- Checks before pushing: `npx tsc --noEmit && npm test && npx next build`, plus the e2e scripts in `tests/e2e/README.md` that the change touches.
