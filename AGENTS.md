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

Default to:

- **one branch**
- **one Draft PR**
- **one coherent slice**
- **base branch = `main`**

Branch names should be narrow and descriptive.

Good examples:

- `feat/forge-preview-shell`
- `chore/ci-release-flow`
- `refactor/remove-nitric`

Avoid vague or oversized branch names such as:

- `new-forge`
- `big-refactor`
- `cleanup-everything`

Branch scope should match the actual unit of review. If the branch description stops being precise, the branch is probably too large.

### Default workflow

Use a single task-specific branch from `main`, open a Draft PR to `main`, and keep pushing commits to that same branch until the slice is coherent.

This is the normal workflow.

### Large initiative workflow

For a larger initiative, do **not** create a long-lived dumping-ground branch.

Instead:

- create an umbrella issue or planning note
- split the work into a small number of coherent slices
- create separate branches from `main`
- open separate Draft PRs to `main`

Prefer this shape:

- `chore/repo-policy-and-agents`
- `chore/add-moonrepo-baseline`
- `chore/migrate-gha-release-flow`

Do **not** silently accumulate unrelated work into one branch just because it is already open.

### Stacked branch workflow

Use stacked branches **only** when one slice truly depends on another and stacking materially improves reviewability.

Rules for stacked branches:

- keep the stack shallow
- prefer 2 levels, avoid going beyond 3
- document the dependency clearly in the PR description
- rebase or restack when the lower branch changes significantly

Do **not** use stacked branches as the default workflow.

### Draft PR rules

- Default to a **Draft PR** first.
- Use Draft PRs for visibility, early CI, and incremental discussion.
- Mark a PR ready for review only when the slice is coherent.
- A Draft PR is still a PR for a single branch; it is not a container for multiple branches.
- If commits from another branch are needed, merge, rebase, or cherry-pick them onto the PR branch intentionally.

PR descriptions should include:

- **purpose**
- **scope**
- **risks**
- **linked issue(s)**
- **rollout / feature-flag notes**
- **dependency notes** for stacked work, if applicable

Keep PRs focused. A reviewer should be able to explain the purpose of the PR in one or two sentences.

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

## Recovery rules

If a branch becomes messy, stop and summarize:

- what is safe
- what is risky
- what should be split
- what should be cherry-picked
- what should be discarded

Favor salvageable commits over forcing a giant merge. Preserve useful work, but restore reviewability.

If needed, use:

- **worktrees** for parallel branch work
- **cherry-pick** to salvage clean commits
- **rebase** to keep long-lived branches current
- **fresh branches from `main`** when cleanup is cheaper than repair

---

## Human collaboration rules

- Link work to GitHub Issues whenever possible.
- Use Draft PRs to expose current state early.
- Leave concise notes when assumptions are made.
- When tradeoffs are introduced, document them clearly.
- Prefer clarity for the next human over cleverness for the current agent.

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
