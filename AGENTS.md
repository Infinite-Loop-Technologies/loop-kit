# AGENTS.md

## Purpose

This repository is the **loop-kit monorepo**. It contains the core loop-kit packages, shared tooling, repository automation, and **Forge**, the agentic development environment being built on top of loop-kit.

This repo is both **product code** and **platform code**. Changes here must optimize for:

- narrow, reviewable slices
- deterministic automation
- explicit policy over vague convention
- clear repository history
- future migration flexibility
- minimal blast radius

Agents working in this repository must preserve clarity, minimize risk, and avoid “helpful” scope expansion.

---

## Repository identity

The canonical GitHub repository for this workspace is `Infinite-Loop-Technologies/loop-kit`.

Important:

- This repository is owned by the `Infinite-Loop-Technologies` organization.
- Do not assume the authenticated GitHub user owns the repository.
- When using GitHub MCP tools, prefer `owner = "Infinite-Loop-Technologies"` and `repo = "loop-kit"` unless the task explicitly targets another repository.

---

## Non-negotiable rules

1. **Do not push directly to `main`.**
2. **Do not merge your own PRs into `main` unless explicitly instructed.**
3. **Prefer one issue or one coherent goal per branch.**
4. **Open Draft PRs early for work in progress.**
5. **Keep commits small, logical, and easy to review.**
6. **Do not mix unrelated refactors with the main task.**
7. **Do not expand scope unless you document why.**
8. **Run the relevant checks before asking for review.**
9. **Use feature flags for unfinished runtime behavior instead of long-lived hidden branches.**
10. **If blocked by missing context, state the constraint clearly instead of guessing.**
11. **Always verify Git state before making changes. Never assume the current branch is correct for the task.**
12. **Always prefer existing MCP tools and repository automation over ad hoc manual guessing.**
13. **Do not attempt to repair broken MCP/tooling setup unless the task is explicitly about fixing that setup. Stop, report the missing capability clearly, and have the human fix the environment first.**

---

## Git responsibility rules

Before starting work, always:

- inspect the current branch
- inspect working tree status
- inspect local uncommitted changes
- confirm whether there is already an open PR for the branch
- confirm whether the branch actually matches the requested task
- create or switch to a narrow task-specific branch if needed

Never assume:

- that the current branch is correct
- that uncommitted changes are safe to reuse
- that an existing branch is still the right place for new work
- that a PR already exists or is in the correct state

When available, use the **GitHub MCP server** or equivalent repository tooling to inspect PR state, branch context, checks, related issues, and repository metadata instead of guessing from partial local state.

If GitHub MCP or another required MCP is unavailable or misconfigured, **stop immediately** and report the constraint. Do **not** improvise around missing repository visibility, and do **not** start “fixing the MCP” unless explicitly instructed.

If a branch has not been pushed yet and its scope is no longer accurate, rename it.

---

## MCP and tooling rules

- Use **Context7 MCP by default** whenever library/API documentation, setup steps, configuration details, or code-generation guidance is needed.
- Use **Playwright MCP** for validating complex or fragile web UI behavior.
- For non-trivial UI work, prefer **real validation** over visual guessing:
    - use Playwright MCP
    - add or improve automated tests where appropriate
    - add stable selectors such as `data-testid`, `data-*` attributes, or durable IDs when needed for reliable automation
- Use direct MCP integrations such as GitHub whenever available instead of recreating their capabilities manually.
- If a task depends on an MCP integration that is not available, state that clearly and stop rather than faking confidence.

---

## Branching and PR workflow

Default to a **serial slice workflow**.

For this repository, the default is:

- one active implementation branch
- one Draft PR to `main`
- one coherent slice
- merge that slice before starting the next dependent slice

This is the default, not a prohibition on multiple active branches.

### Default workflow

1. Start from updated `main`.
2. Create a narrow task-specific branch.
3. Open a Draft PR to `main` early for visibility and CI.
4. Keep pushing commits to that same branch until the slice is coherent.
5. Run the relevant checks.
6. Mark ready for review only when the slice is reviewable.
7. Merge the slice.
8. Start the next dependent slice from the new `main`.

### Large initiative workflow

For a larger initiative, create an umbrella issue or planning note, then execute the work as a **sequence of coherent slices**.

Example:

- `chore/repo-policy-and-agents`
- `chore/repo-automation-moon-migration`
- `chore/release-workflow-hardening`

The default should be to merge enabling slices first, then branch the next slice from updated `main`.

### Side-by-side branches

Use multiple active branches only when:

- the work is truly independent, or
- one slice is blocked and another unrelated slice can proceed safely, or
- there is a deliberate short dependency chain that is still manageable

Do not create multiple overlapping branches by default.

### Stacked branches

Use stacked branches only when one slice truly depends on another and merging the lower slice first is not practical.

Rules for stacked branches:

- keep the stack shallow
- prefer 2 levels
- avoid going beyond 3
- document the dependency clearly in the PR description

Do not use stacked branches as the default workflow.

### Draft PR rules

- Default to a **Draft PR** first.
- Use Draft PRs for visibility, CI, self-review, and incremental discussion.
- A Draft PR is still a PR for a single head branch against a single base branch.
- If commits from another branch are needed, merge, rebase, or cherry-pick them intentionally onto the PR branch.
- Do not treat a Draft PR as a container for multiple branches.

PR descriptions should include:

- **purpose**
- **scope**
- **risks**
- **linked issue(s)**
- **rollout / feature-flag notes**
- **dependency notes** for stacked work, if applicable

Keep PRs focused. A reviewer should be able to explain the purpose of the PR in one or two sentences.

### Tiny unrelated changes

- If a tiny docs or README fix is directly related to the current task, it may be included in the same branch.
- If it is unrelated, prefer a short-lived focused docs/chore branch.
- Do not accumulate random unrelated cleanup in a long-lived catch-all branch.

### Expected task completion posture

For repository code changes, the default goal is to end with:

- a task-appropriate branch
- clear commits
- relevant checks run
- a Draft PR opened or updated

If a task is research, planning, triage, or another non-code activity, a PR is not required.

### Recovery tools

When a branch becomes messy, prefer repair by:

- cherry-picking clean commits into a fresh branch
- rebasing or merging from `main` when needed
- using worktrees for parallel work only when useful

If cleanup is cheaper than continuing, stop and create a fresh branch from `main`.

---

## CI rules

- PRs must pass the relevant **affected** checks.
- Production deployments must be **manual or tag-triggered only**.
- Do not change CI/CD behavior unless the task is explicitly about CI/CD.
- Do not weaken checks just to get a branch through.
- Prefer explicit scripts and task definitions over ad hoc CI logic.

---

## Deployment rules

- Preview deployments from PR workflows are allowed.
- Production deployments must go through the release workflow.
- Do not auto-enable unfinished user-facing behavior without an explicit flag or approval.
- Deployment automation must remain deliberate and inspectable.

---

## Refactor rules

- Separate **mechanical changes** from **behavioral changes** when practical.
- If a migration is large, split groundwork from behavior changes.
- Prefer extracting reusable groundwork first, then consuming it in follow-up changes.
- Do not hide structural rewrites inside feature work.

---

## Testing and TDD rules

Tests must prove behavior, not create noise.

### Default testing strategy

- Use **Vitest** by default for JavaScript / TypeScript unit and integration tests.
- Use **Playwright** for end-to-end testing, complex UI behavior, and fragile browser flows.
- For non-trivial UI work, prefer real interaction testing over visual guessing.
- Add durable selectors such as `data-testid`, other `data-*` attributes, or stable IDs when needed for reliable automation.

### TDD posture

Prefer test-first or test-nearby development for:

- bug fixes
- parsers
- planners
- graph logic
- transforms
- CI / release logic
- other code with a crisp contract

For UI-heavy work, tests may be added immediately after implementation if that is more practical, but the final change must still include meaningful validation.

### Test quality rules

- Prefer focused assertions over broad brittle snapshots.
- Avoid tests that only restate implementation details.
- Prefer tests that exercise observable behavior and failure modes.
- After conflict resolution, rebasing, merging, or cherry-picking, rerun the relevant tests.
- Use fuzzing or property-based testing selectively for code that benefits from wide-input validation, such as parsers, patch logic, and graph transformations.

---

## Recovery rules

If a branch becomes messy, stop and summarize:

- what is safe
- what is risky
- what should be split
- what should be cherry-picked
- what should be discarded

Favor salvageable commits over forcing a giant merge. Preserve useful work, but restore reviewability.

---

## Human collaboration rules

- Link work to GitHub Issues whenever possible.
- Use Draft PRs to expose current state early.
- Leave concise notes when assumptions are made.
- When tradeoffs are introduced, document them clearly.
- Prefer clarity for the next human over cleverness for the current agent.

---

## Issue and task management rules

- Use **GitHub Issues** as the default task system for repository work unless explicitly instructed otherwise.
- Prefer one coherent problem, feature, bug, or migration slice per issue.
- Use umbrella issues for large initiatives and smaller linked issues for execution slices.
- Link branches and PRs to issues whenever practical.
- If an issue already exists for the requested task, use it.
- If no issue exists and the task is substantial, create or suggest creating one before or during the work.
- Do not create issue spam for trivial one-line edits unless tracking them is genuinely useful.

---

## Tooling posture

- The current repository direction is **Moonrepo + GitHub Actions**.
- Prefer explicit Moon tasks and repository scripts over orchestration sprawl.
- Do not introduce or reintroduce Dagger unless the task explicitly requires it.
- Local Git hooks may be used as guardrails, but they are not a replacement for CI or branch protection.
- Keep tool versions pinned in **`.prototools`**.
- Update tool pins intentionally and commit those pin changes as part of the relevant work.

---

## Forge and loop-kit philosophy

This repository is moving toward stronger **policy-driven development**.

For now:

- **Git** is the storage and collaboration layer.
- **CI** is the enforcement layer.
- **Scripts, checks, tests, and documented rules** are preferred over vague agent instructions.
- Future loop-kit and Forge semantics must be implemented through explicit tooling, policy, and code — not implied by prompts alone.

Agents must not pretend that future platform semantics already exist. If a rule is not enforced yet, either implement the enforcement or describe the gap plainly.

The goal is not merely to make the repo pass today. The goal is to leave behind a system that remains understandable, enforceable, and evolvable.
