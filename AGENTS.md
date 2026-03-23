# AGENTS.md

## Purpose

`loop-kit` is the monorepo for loop-kit and Forge. Treat it as a capability-driven platform for composable software units, registry-aware tooling, and future agentic product surfaces. Canonical GitHub repo: `Infinite-Loop-Technologies/loop-kit`.

Use this file as a table of contents. Open the linked docs that match the task, and follow important links instead of guessing.

## Start Here

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [PLANS.md](./PLANS.md)
- [docs/ref/repo-workflow/index.md](./docs/ref/repo-workflow/index.md)
- [docs/ref/repo-workflow/agentic-dev-workflow.md](./docs/ref/repo-workflow/agentic-dev-workflow.md)
- [docs/ref/repo-workflow/validation-and-verification.md](./docs/ref/repo-workflow/validation-and-verification.md)

If the task is knowledge-management-heavy, always review [docs/ref/repo-workflow/index.md](./docs/ref/repo-workflow/index.md) before editing and again before you consider the task done.

## Repo Map

- `apps/`: runtime shells such as Forge web, Forge desktop, and UI demo
- `packages/`: reusable product, platform, and runtime packages
- `loop/`: loop registry/install artifacts and component manifests
- `docs/visions/`: repo-spanning strategic directions that can spawn multiple project plans
- `docs/project-plans/`: large desired outcomes, grouped by status
- `docs/next-actions/`: immediate executable actions, still substantial enough for a focused session, grouped by status
- `docs/ref/`: reusable references, repo workflow docs, and tech-stack notes
- `docs/agent-inbox/`: agent-captured notes, prompts, and follow-ups that should become action or be discarded
- `docs/human-inbox/`: files for work blocked on a human
- `.codex/skills/`: repo-local reusable skills

## Non-Negotiables

- Do not push directly to `main` or merge your own PR into `main` unless explicitly told to.
- Never develop on `main`; if work starts from a dirty or ahead-of-origin `main`, cut a branch immediately and continue only from a branch that is current with `main`, replaying prior work with `git cherry-pick` or `git rebase` instead of extending stale history on `main`.
- Keep one coherent goal per branch, PR, and commit sequence.
- Check git state before non-trivial work: branch, status, local changes, scope fit, and existing PR context when relevant.
- Preserve user work. Do not reset, stash, clean, overwrite, or rewrite history without explicit approval.
- Prefer existing automation and MCP integrations when available; if a required tool is unavailable, say so plainly.
- Keep changes narrow, reviewable, and documented when assumptions or tradeoffs matter.

## Knowledge Management Workflow

Use a GTD-style flow: capture, clarify, organize, review, engage.

- If something takes 2 minutes or less and is clearly in scope, do it.
- Otherwise, turn it into a file in `docs/visions/...`, `docs/project-plans/...`, `docs/next-actions/...`, `docs/agent-inbox/`, or `docs/human-inbox/`.
- Treat `docs/agent-inbox/` as a durable async queue that humans, scripts, webhooks, and agents may inject into at any time; run an emergency scan there before pulling from active next actions.
- Use the planning hierarchy intentionally: `vision -> project plan -> next action`.
- Exact next actions belong in `docs/next-actions/`, not buried inside large project plans.
- Before finishing any non-trivial task, review [docs/ref/repo-workflow/index.md](./docs/ref/repo-workflow/index.md) and do the inbox/review steps it requires.
- Small relevant items in `docs/agent-inbox/` should be done now; larger ones should be converted into next actions. Human-blocked items go in `docs/human-inbox/` as new files.

## Git And PRs

Prefer narrow task branches, one Draft PR per coherent slice, and worktrees when unrelated dirty work would make the current checkout risky. If a branch becomes messy, salvage reviewable commits into a fresh branch instead of hiding the problem in one giant merge.

## Validation

Validation is required before you are done. Use [docs/ref/repo-workflow/validation-and-verification.md](./docs/ref/repo-workflow/validation-and-verification.md), prefer Moon/Proto tasks, add or update tests when behavior changes, and always run the `markdown-backlinks` skill after markdown changes.

## Human Collaboration

Write human-blocked items to `docs/human-inbox/` as new files. Put agent handoffs, mind-sweep captures, or follow-up prompts in `docs/agent-inbox/` as new files until they are processed. Keep notes short and easy to triage.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
