# UNL X5: rebase the LINE-chat journey branch (Codex)

Send to Codex in the `unlimit-insure-codex` folder:

```
UNL X5: rebase codex/x5-line-chat-journey onto main. Follow AGENTS.md.

Context: the branch (4 commits, last 8c02e47) was cut before PR #2 (X6, scenario guide) and PR #3 (X7, public catalogue gate) merged. It now conflicts with main in 11 files: app/(site)/advisor, compare, insurance, lab/[slug], home page.tsx, quote/results, components/home/QuickQuote, components/insurance/AdvisorContact, layout/Footer, layout/Header, and components/lab/LabTool.tsx (deleted on x5, changed on main).

1. git fetch origin && git checkout -b codex/x5-rebase origin/codex/x5-line-chat-journey && git rebase origin/main
2. Resolve each conflict. Where X6/X7 on main already do what an x5 commit did, keep main's version and drop that part.
   Keep what is still new: the three-step public journey, no public packages, redirects and their tests, the advisor handoff ignoring sample plan IDs.
3. Push codex/x5-rebase. Do not force-push or delete codex/x5-line-chat-journey; Core deletes it after the merge.
4. Checks: npx tsc --noEmit, npm test, npx next build, npm run cf:build, npx wrangler dev + npm run e2e:journey and e2e:a11y.
5. Open a PR to main titled "X5: LINE-first quote journey (rebased on X6/X7)".
6. Report (AGENTS.md format), plus a list of what you dropped from x5 and why.

X8 (sub-model field) starts from main only after this PR is merged, so keep the PR small and say clearly what changed.
```
