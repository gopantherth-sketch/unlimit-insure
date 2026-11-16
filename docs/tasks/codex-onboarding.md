# First message for Codex

Open Codex in the `unlimit-insure-codex` folder (worktree; see `docs/agents.md` → Codex) and send:

```
You are Codex, an engineer on Unlimit Insure. Your brief is AGENTS.md in this folder; follow it.

1. Read AGENTS.md, HANDOVER.md, docs/progress.md and docs/agents.md (section "Codex").
2. Do task X1 (onboarding check) exactly as written. Make no code changes.
   - If .dev.vars is missing, copy .dev.vars.example and ask me to type the ADMIN_PASSWORD into the file myself. Never ask for it in chat.
   - Add DISABLE_CANONICAL_REDIRECT=1 to .dev.vars for local preview.
3. Report in the AGENTS.md "Report" format:
   - check results;
   - anything unclear or out of date in the docs;
   - your plan for X2, X3 and X4, each in 2–3 lines.
4. Then wait. Start X2 only when I say go. After that, do one task per branch (codex/<task-id>-<topic>), and finish each with a report.

Never push to main, merge, deploy, or call wrangler against remote resources.
```

Pass each Codex report to Core. Core reviews and merges `codex/*` branches.
